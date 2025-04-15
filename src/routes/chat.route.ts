import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middleware';
import { upload, importChatHistory } from '../controllers/chat-import.controller';

const router = Router();

router.post('/import', verifyJWT, upload.single('chatFile'), importChatHistory);

export default router;