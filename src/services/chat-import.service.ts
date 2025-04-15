import { getDBClient } from "../db/index";
import { ResultSetHeader } from 'mysql2/promise';
import { ApiError } from "../utils/ApiError";
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

interface ChatMessage {
  sender_id: number;
  receiver_id: number;
  message: string;
  timestamp: Date;
  message_type: 'text';
}

export class ChatImportService {
  async importFromExcel(filePath: string, userId: number): Promise<{ imported: number; errors: string[] }> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      const validatedData = this.validateChatData(data, userId);
      
      const importResult = await this.saveMessagesToDatabase(validatedData.validMessages);
      
      return {
        imported: importResult.imported,
        errors: validatedData.errors
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Failed to import chat history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private validateChatData(data: any[], userId: number): { validMessages: ChatMessage[], errors: string[] } {
    const validMessages: ChatMessage[] = [];
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      try {
        if (!row.sender_id || !row.receiver_id || !row.message || !row.timestamp) {
          throw new Error(`Row ${index + 1}: Missing required fields`);
        }
        
        const chatMessage: ChatMessage = {
          sender_id: Number(row.sender_id),
          receiver_id: Number(row.receiver_id),
          message: String(row.message),
          timestamp: new Date(row.timestamp),
          message_type: 'text',
        };
        
        validMessages.push(chatMessage);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : `Row ${index + 1}: Invalid data`);
      }
    });
    
    return { validMessages, errors };
  }
  
  private async saveMessagesToDatabase(messages: ChatMessage[]): Promise<{ imported: number }> {
    if (messages.length === 0) {
      return { imported: 0 };
    }
    
    const client = await getDBClient();
    let imported = 0;
    
    try {
      await client.query('START TRANSACTION');
      
      for (const message of messages) {
        const chatId = uuidv4();
        const [result] = await client.query<ResultSetHeader>(
          `INSERT INTO chat_messages 
           (chat_id, sender_id, receiver_id, message, timestamp, message_type, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            chatId,
            message.sender_id,
            message.receiver_id,
            message.message,
            message.timestamp,
            message.message_type,
          ]
        );
        
        if (result.affectedRows > 0) {
          imported++;
        }
      }
    
      await client.query('COMMIT');
      return { imported };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      await client.release();
    }
  }
}