import express from "express";
import { createApplicationcitizen } from "../controllers/citizen-application-controller";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.array("files"), createApplicationcitizen);

export default router;