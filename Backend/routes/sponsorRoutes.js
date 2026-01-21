import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import {
  addSponsor,
  getSponsors,
  getSponsor,
  updateSponsor,
  deleteSponsor,
} from "../controllers/sponsorController.js";

const router = express.Router();

router.get("/", authMiddleware, getSponsors);
router.post("/add", authMiddleware, upload.single("logo"), addSponsor);
router.get("/:id", authMiddleware, getSponsor);
router.put("/:id", authMiddleware, upload.single("logo"), updateSponsor);
router.delete("/:id", authMiddleware, deleteSponsor);

export default router;