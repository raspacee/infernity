import { Request, Response } from "express";
import * as arctic from "arctic";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { google, GoogleUser } from "../utils/arctic";
import { db } from "../db";
import { signupVerificationTable, usersTable } from "../db/schema";
import { generateAccessToken, JwtUser } from "../utils/jwt";
import { LoginSchemaType, SignupSchemaType } from "../lib/schemas";
import { sanitizeInput, sendVerificationLinkToUser } from "../lib/helpers";
import bcrypt from "bcryptjs";
import { DateTime } from "luxon";
import jwt from "jsonwebtoken";
import validator from "validator";

export class AuthController {
  signinUser = async (req: Request, res: Response) => {
    try {
      const loginForm: LoginSchemaType = req.body;
      loginForm.email = validator
        .normalizeEmail(sanitizeInput(loginForm.email))
        .toString();

      const [existingUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, loginForm.email))
        .limit(1);
      if (!existingUser)
        return res.status(404).json({ message: "Email is not registered" });

      if (!existingUser.password)
        return res
          .status(401)
          .json({ message: "Email is registered through OAUTH" });

      const isValidPassword = await bcrypt.compare(
        loginForm.password,
        existingUser.password
      );
      if (isValidPassword) {
        const jwtUser: JwtUser = {
          id: existingUser.id,
          email: existingUser.email,
        };
        const accessToken = generateAccessToken(jwtUser);

        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("access_token", accessToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 30 days, same as access token
          domain: isProduction ? process.env.SITE_DOMAIN : "localhost",
        });

        return res.status(200).json({ message: "Signed In Successfully" });
      } else {
        return res.status(401).json({
          message: "Incorrect credentials",
        });
      }
    } catch (err) {
      return res.status(500).json({
        message: "Error while signing in",
      });
    }
  };

  verifySignup = async (req: Request, res: Response) => {
    try {
      const verificationCode: string = sanitizeInput(req.body.verificationCode);
      const results = await db
        .select()
        .from(signupVerificationTable)
        .where(eq(signupVerificationTable.id, verificationCode))
        .limit(1);
      if (results.length == 0)
        return res
          .status(403)
          .json({ message: "Verification code does not exist" });

      const verification = results[0];
      /* Check if verification code is expired or not */
      const isExpired =
        DateTime.fromSQL(verification.expiresAt).toUTC() <
        DateTime.now().toUTC();
      if (isExpired) {
        return res.status(401).json({
          message: "Verification code is expired",
          email: verification.email,
          userId: verification.userId,
        });
      } else {
        /* Verify the user and delete the link */
        await db
          .update(usersTable)
          .set({ isVerified: true })
          .where(eq(usersTable.id, verification.userId));
        await db
          .delete(signupVerificationTable)
          .where(eq(signupVerificationTable.id, verification.id));
        return res.status(200).json({ message: "Your account is verified" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  };

  signupUser = async (req: Request, res: Response) => {
    try {
      const newUserForm: SignupSchemaType = req.body;
      newUserForm.email = sanitizeInput(newUserForm.email);
      newUserForm.password = newUserForm.password;
      newUserForm.username = sanitizeInput(newUserForm.username);

      const [existingUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, newUserForm.email));
      if (existingUser)
        return res.status(403).json({ message: "Email is already registered" });

      const newUUID = uuid();

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newUserForm.password, salt);

      const newUser: typeof usersTable.$inferInsert = {
        id: newUUID,
        email: newUserForm.email.toLowerCase(),
        name: newUserForm.username,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        isVerified: false,
        isTraditionalAccount: true,
      };
      await db.insert(usersTable).values(newUser);

      await sendVerificationLinkToUser(newUserForm.email, newUUID);

      return res.status(201).json({ message: "Signup Successful" });
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  };

  public async handleGoogleOAuth(req: Request, res: Response) {
    try {
      const state = arctic.generateState();
      const codeVerifier = arctic.generateCodeVerifier();
      const scopes = ["openid", "profile", "email"];
      const url = google.createAuthorizationURL(state, codeVerifier, scopes);
      res.cookie("code_verifier", codeVerifier, {
        secure: true,
        httpOnly: process.env.NODE_ENV === "production",
      });
      return res.redirect(url.href);
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  }

  public async handleGoogleOAuthCallback(req: Request, res: Response) {
    try {
      const code = req.query.code as string;
      const codeVerifier = req.cookies["code_verifier"] as string;
      const tokens = await google.validateAuthorizationCode(code, codeVerifier);
      const googleAccessToken = tokens.accessToken();

      const response = await fetch(
        "https://openidconnect.googleapis.com/v1/userinfo",
        {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
          },
        }
      );

      const user = (await response.json()) as GoogleUser;

      if (!user) throw new Error("Error decoding user from response");

      const [existingUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.providerId, user.sub))
        .limit(1);

      let userRecord: typeof usersTable.$inferSelect;

      if (!existingUser) {
        const [newUser] = await db
          .insert(usersTable)
          .values({
            id: uuid(),
            email: user.email,
            name: user.name,
            providerId: user.sub,
            provider: "google",
            avatarUrl: null,
            createdAt: new Date().toISOString(),
            isTraditionalAccount: false,
            isVerified: true,
          })
          .returning();
        userRecord = newUser;
      } else {
        userRecord = existingUser;
      }

      const jwtUser: JwtUser = {
        id: userRecord.id,
        email: userRecord.email,
      };

      const accessToken = generateAccessToken(jwtUser);

      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 30 days, same as access token
        domain: isProduction ? process.env.SITE_DOMAIN : "localhost",
      });

      return res.redirect(new URL("/", process.env.FRONTEND_URL!).toString());
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  }

  public async handleLogout(req: Request, res: Response) {
    try {
      const isProduction = process.env.NODE_ENV === "production";

      res.clearCookie("access_token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        domain: isProduction ? process.env.SITE_DOMAIN : "localhost",
      });

      return res.status(200).json({ message: "Logged out!" });
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  }

  public async userIsVerified(req: Request, res: Response) {
    console.log(req.cookies);
    const token = req.cookies?.access_token;

    if (!token) {
      res.status(401).json({ error: "No access token provided" });
      return;
    }

    try {
      const secretKey = process.env.ACCESS_TOKEN_SECRET;

      if (!secretKey) {
        console.error("ACCESS_TOKEN_SECRET not configured");
        res.status(500).json({ error: "Server configuration error" });
        return;
      }

      const decoded = jwt.verify(token, secretKey) as JwtUser;

      const [user] = await db
        .select({ isVerified: usersTable.isVerified })
        .from(usersTable)
        .where(eq(usersTable.id, decoded.id))
        .limit(1);

      console.log(user);

      if (user.isVerified) return res.status(200).json();

      return res.status(403).json();
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  }
}
