import express from "express";
import {
  login,
  verify,
  mobileLogin,
  mobileRefresh,
  mobileLogout,
  logoutAll,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { loginLimiter } from "../middleware/loginRateLimit.js";

const router = express.Router();

router.post("/login", loginLimiter, login);
router.post("/verify", authMiddleware, verify);

router.post("/mobile/login", loginLimiter, mobileLogin);
router.post("/mobile/refresh", mobileRefresh);
router.post("/mobile/logout", mobileLogout);
router.post("/logout-all", authMiddleware, logoutAll);

export default router;
