import express from "express";
import { getLawsuitsByLawyer, updateLawsuitWithFiles , getLawsuitById } from "../controllers/lawsuit-trackingForLawyer-controller";
import { authenticateToken } from "../middleware/user-auth";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Tüm davaları getir
router.get("/", authenticateToken, getLawsuitsByLawyer);

  router.put(
    "/:lawsuitId",
    authenticateToken,
    upload.array("files"), // Güncelleme sırasında da dosya yükleme yapılabilir
    updateLawsuitWithFiles
  );

router.get("/:lawsuitId", authenticateToken, getLawsuitById);

  
export default router;
