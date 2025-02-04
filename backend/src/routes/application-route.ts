import express from "express";
import {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
} from "../controllers/application-controller";

import multer from "multer";
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Bellekte dosyaları sakla
// Yeni başvuru oluşturma
router.post("/", upload.array("files"), createApplication);
// Tüm başvuruları listeleme
router.get("/applications", getAllApplications);
// ID'ye göre başvuru getirme
router.get("/:id", getApplicationById);
// Başvuru düzenleme
router.put("/:id", upload.array("files"), updateApplication);

export default router;