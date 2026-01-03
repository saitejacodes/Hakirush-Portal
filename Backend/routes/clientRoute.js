import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addClient, getClient, getClients, updateClient, deleteClient, upload } from "../controllers/clientController.js";

const router = express.Router();

router.get("/", authMiddleware, getClients);
router.post("/add", authMiddleware, upload.single("image"), addClient);
router.get("/:id", authMiddleware, getClient);
router.put("/:id", authMiddleware, upload.single("image"), updateClient);
router.delete("/:id", authMiddleware, deleteClient);

export default router;
