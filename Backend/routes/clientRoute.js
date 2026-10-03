import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles, { requireAdmin, requireClient } from "../middleware/roleMiddleware.js";
// Shared image upload middleware (owned by the platform agent; returns normalized JSON errors).
import upload from "../middleware/upload.js";

import {
  addClient,
  getClients,
  getClient,
  getMyClient,
  updateClient,
  deleteClient,
  getClientPerformance,
  getClientImages,
  getMyRoster,
  addMyRosterEntry,
  deleteMyRosterEntry,
  getMyGallery,
  getMyPerformance,
  getClientGallery,
  addClientGalleryImage,
  deleteClientGalleryImage,
  getClientPerformanceAdmin,
  putClientPerformance,
} from "../controllers/clientController.js";

const router = express.Router();
const adminOrClient = authorizeRoles("admin", "client");

/* Legacy reads: client -> own data (query userId ignored); admin -> ?userId= */
router.get("/images", authMiddleware, adminOrClient, getClientImages);
router.get("/performance", authMiddleware, adminOrClient, getClientPerformance);

/* Client self-service */
router.get("/me", authMiddleware, requireClient, getMyClient);
router.get("/me/roster", authMiddleware, requireClient, getMyRoster);
router.post("/me/roster", authMiddleware, requireClient, addMyRosterEntry);
router.delete("/me/roster/:entryId", authMiddleware, requireClient, deleteMyRosterEntry);
router.get("/me/gallery", authMiddleware, requireClient, getMyGallery);
router.get("/me/performance", authMiddleware, requireClient, getMyPerformance);

/* Admin management */
router.get("/", authMiddleware, requireAdmin, getClients);
router.post("/add", authMiddleware, requireAdmin, upload.single("companyLogo"), addClient);

router.get("/:id/gallery", authMiddleware, requireAdmin, getClientGallery);
router.post("/:id/gallery", authMiddleware, requireAdmin, upload.single("image"), addClientGalleryImage);
router.delete("/:id/gallery/:imageId", authMiddleware, requireAdmin, deleteClientGalleryImage);
router.get("/:id/performance", authMiddleware, requireAdmin, getClientPerformanceAdmin);
router.put("/:id/performance", authMiddleware, requireAdmin, putClientPerformance);

router.get("/:id", authMiddleware, adminOrClient, getClient);
router.put("/:id", authMiddleware, requireAdmin, upload.single("companyLogo"), updateClient);
router.delete("/:id", authMiddleware, requireAdmin, deleteClient);

export default router;
