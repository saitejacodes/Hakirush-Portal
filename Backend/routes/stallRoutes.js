import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addStall,
  getStalls,
  getStall,
  updateStall,
  deleteStall
} from "../controllers/stallController.js";

const router = express.Router();

router.get("/", authMiddleware, getStalls);
router.post("/add", authMiddleware, addStall);
router.get("/:id", authMiddleware, getStall);
router.put("/:id", authMiddleware, updateStall);
router.delete("/:id", authMiddleware, deleteStall);

export default router;