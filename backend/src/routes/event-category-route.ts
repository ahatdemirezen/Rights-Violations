import express from "express";
import {
  createEventCategory,
  updateEventCategory,
  deleteEventCategory,
} from "../controllers/event-category-controller";
const router = express.Router();
router.post("/", createEventCategory);
router.put("/:id", updateEventCategory);
router.delete("/:id", deleteEventCategory);
export default router;