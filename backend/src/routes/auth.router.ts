import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";

const router = Router();

const authController = new AuthController();

router.get("/user-is-verified", authController.userIsVerified);

router.post("/signup", authController.signupUser);

router.post("/signin", authController.signinUser);

router.post("/verify-signup", authController.verifySignup);

router.get("/google/callback", authController.handleGoogleOAuthCallback);

router.get("/google", authController.handleGoogleOAuth);

router.post("/logout", authController.handleLogout);

export default router;
