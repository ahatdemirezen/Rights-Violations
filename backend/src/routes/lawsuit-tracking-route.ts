import express from "express";
import multer from "multer";
import { createLawsuitWithFiles , getLawsuitById , getAllLawsuits , updateLawsuitWithFiles , updateLawsuitArchiveStatus } from "../controllers/lawsuit-tracking-controller";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/:applicationId",
  (req, res, next) => {
    console.log("Router Seviyesi: Gelen Request:");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body); // req.body burada genelde boş olur (çünkü multer'dan önce işlenmemiştir).
    next(); // Bir sonraki middleware'e geç
  },
  upload.array("files"), // Multer middleware
  (req, res, next) => {
    console.log("Router Seviyesi: Multer Middleware Sonrası:");
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    next(); // Controller'a geç
  },
  createLawsuitWithFiles
);

router.put("/:lawsuitId/archive", updateLawsuitArchiveStatus);

router.get("/:lawsuitId", getLawsuitById);
router.get("/", getAllLawsuits);

router.put(
  "/:lawsuitId",
  upload.array("files"), // Güncelleme sırasında da dosya yükleme yapılabilir
  updateLawsuitWithFiles
);
export default router;
