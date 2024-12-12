import express from "express";
import { getAllApplicationByLawyer , getApplicationDetailsByLawyer } from "../controllers/applicationForLawyer-controller";
import { authenticateToken } from "../middleware/user-auth";

const router = express.Router();

router.get("/", authenticateToken, getAllApplicationByLawyer);

router.get("/:applicationId", authenticateToken, getApplicationDetailsByLawyer);

export default router;
