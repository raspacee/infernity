import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";

const router = Router();

const authController = new AuthController();

router.get("/google/callback", authController.handleGoogleOAuthCallback);

router.get("/google", authController.handleGoogleOAuth);

router.post("/logout", authController.handleLogout);

export default router;
