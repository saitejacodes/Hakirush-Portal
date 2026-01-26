import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

import {
  addClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";

const router = express.Router();

/* ================= ROUTE LOG ================= */
router.use((req, res, next) => {
  console.log("CLIENT ROUTE:", req.method, req.originalUrl);
  next();
});

/* ================= ROUTES ================= */

router.get("/", authMiddleware, getClients);

router.post(
  "/add",
  authMiddleware,
  upload.single("image"), // 🔥 same as frontend
  addClient
);

router.get("/:id", authMiddleware, getClient);

router.put(
  "/:id",
  authMiddleware,
  upload.single("image"), // 🔥 same as frontend
  updateClient
);

router.delete("/:id", authMiddleware, deleteClient);

export default router;
