import express from "express";
import multer from "multer";
import { createLawsuitWithFiles , getLawsuitById , getAllLawsuits , updateLawsuitWithFiles } from "../controllers/lawsuit-tracking-controller";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Bellekte dosyaları sakla

router.post(
  "/:applicationId",
  upload.array("files"), // Birden fazla dosya için multer yapılandırması
  createLawsuitWithFiles
);

router.get("/:lawsuitId", getLawsuitById);
router.get("/", getAllLawsuits);

router.put(
  "/:lawsuitId",
  upload.array("files"), // Güncelleme sırasında da dosya yükleme yapılabilir
  updateLawsuitWithFiles
);
export default router;
