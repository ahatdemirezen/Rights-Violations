import express from "express";
import {
  createComplaintReason,
  updateReason,
  deleteReason,
  addReason,
} from "../controllers/complaint-reason-controller";
const router = express.Router();
// Yeni Şikayet Nedeni Ekle
router.post("/", createComplaintReason);
// Yeni Reason Ekle (Bir reasons içindeki diziye ekle)
router.post("/:id", addReason);
// Şikayet Nedeni Güncelle
router.put("/:id", updateReason);
// Şikayet Nedeni Sil
router.delete("/:id", deleteReason);

export default router;