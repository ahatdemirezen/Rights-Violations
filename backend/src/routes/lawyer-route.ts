import express from "express";
import { createUser , getAllLawyers, deleteLawyer, getLawyerById} from "../controllers/lawyer-controller";

const router = express.Router();

// POST isteği için rota
router.post("/", createUser);

router.get('/', getAllLawyers);

router.delete("/:id", deleteLawyer);

router.get("/:id", getLawyerById);

export default router;
