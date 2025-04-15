import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ChatImportService } from "../services/chat-import.service";
import { IAuthRequest } from "../types/request.types";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/ApiError";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = ['.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed'));
  }
};

export const upload = multer({ 
  storage, 
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  } 
});

export const importChatHistory = asyncHandler(async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "No file uploaded");
    }
    
    const chatImportService = new ChatImportService();
    const result = await chatImportService.importFromExcel(req.file.path, req.user.id);
    
    fs.unlinkSync(req.file.path);
    
    res.status(200).json({
      success: true,
      message: "Chat history imported successfully",
      data: {
        imported: result.imported,
        errors: result.errors
      }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to import chat history"
    });
  }
});