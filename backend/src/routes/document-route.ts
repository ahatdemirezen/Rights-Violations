import express from "express";
import { getAllDocuments } from "../controllers/document-controller";

const router = express.Router();

// Tüm dökümanları getirme endpointi
router.get("/", getAllDocuments);

export default router;
