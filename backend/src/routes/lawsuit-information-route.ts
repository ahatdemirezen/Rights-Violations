import express from "express";
import { createLawsuitInformation, getLawsuitInformation } from "../controllers/lawsuit-information-controller";

const router = express.Router();

// POST isteği ile dava bilgisi oluşturma
router.post("/", createLawsuitInformation);

router.get("/:lawsuitTrackinId", getLawsuitInformation);

export default router;
