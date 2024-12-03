import express from "express";
import {
  getAllArchives,
  getArchivesByType,
  createArchive,
  updateArchive,
  deleteArchive,
} from "../controllers/digital-archive-controller";
const router = express.Router();
router.get("/", getAllArchives); // Tüm arşivleri al
router.get("/type/:type", getArchivesByType); // Tür bazlı arşiv al
router.post("/", createArchive); // Yeni arşiv oluştur
router.put("/:id", updateArchive); // Arşiv güncelle
router.delete("/:id", deleteArchive); // Arşiv sil

export default router;