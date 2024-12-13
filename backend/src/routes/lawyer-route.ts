import express from "express";
import { createUser , getAllLawyers, deleteLawyer, getLawyerById , getLawyerNameByUserId} from "../controllers/lawyer-controller";
import { authenticateToken } from "../middleware/user-auth";

const router = express.Router();

// POST isteği için rota
router.post("/", createUser);

router.get('/', getAllLawyers);

router.delete("/:id", deleteLawyer);

router.get("/:id", getLawyerById);

router.get("/name", authenticateToken , getLawyerNameByUserId);

export default router;
