import { Request, Response, NextFunction } from "express";
import { EventCategoryModel } from "../models/eventCategory-model";

// Create a new event category
export const createEventCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name} = req.body;

    const newCategory = new EventCategoryModel({ name});
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};

// Update an event category
export const updateEventCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const { name} = req.body;

  try {
    const updatedCategory = await EventCategoryModel.findByIdAndUpdate(
      id,
      { name},
      { new: true }
    );

    if (!updatedCategory) {
      res.status(404).json({ message: "Category not found" });
    } else {
      res.status(200).json(updatedCategory);
    }
  } catch (error) {
    next(error);
  }
};

// Delete an event category
export const deleteEventCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  try {
    const deletedCategory = await EventCategoryModel.findByIdAndDelete(id);

    if (!deletedCategory) {
      res.status(404).json({ message: "Category not found" });
    } else {
      res.status(200).json({ message: "Category deleted successfully" });
    }
  } catch (error) {
    next(error);
  }
};