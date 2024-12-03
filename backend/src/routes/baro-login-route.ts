import express from "express";
import { LoginControl ,  logoutUser , refreshAccessToken} from "../controllers/login-controller";

const router = express.Router();

// POST isteği için rota
router.post("/", LoginControl);

router.post("/logout", logoutUser);

router.get("/refresh-token", refreshAccessToken); // Yeni route

export default router;
