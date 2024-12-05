import express from "express";
import {
  createEventCategory,
  updateEventCategory,
  deleteEventCategory,
  getAllEventCategories,
} from "../controllers/event-category-controller";
const router = express.Router();
router.post("/", createEventCategory);
router.get("/", getAllEventCategories); // Kategorileri listeleme
router.put("/:id", updateEventCategory);
router.delete("/:id", deleteEventCategory);
export default router;