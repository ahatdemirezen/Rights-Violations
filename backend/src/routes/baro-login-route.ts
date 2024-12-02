import express from "express";
import { createUser ,  logoutUser , refreshAccessToken} from "../controllers/baro-login-controller";

const router = express.Router();

// POST isteği için rota
router.post("/", createUser);

router.post("/logout", logoutUser);

router.get("/refresh-token", refreshAccessToken); // Yeni route

export default router;
