import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.me);

export default router;
