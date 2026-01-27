import express from "express";
import upload from "../middleware/upload.js";
import {
  getAllStalls,
  getStallById,
  createStall,
  updateStall,
  deleteStall
} from "../controllers/stallController.js";

const router = express.Router();

router.get("/", getAllStalls);
router.get("/:id", getStallById);
router.post("/", upload.single("logo"), createStall);
router.put("/:id", upload.single("logo"), updateStall);
router.delete("/:id", deleteStall);

export default router;
