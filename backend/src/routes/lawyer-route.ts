import express from "express";
import { createUser } from "../controllers/lawyer-controller";

const router = express.Router();

// POST isteği için rota
router.post("/", createUser);

export default router;
