import { Request, Response } from "express";
import * as arctic from "arctic";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { google, GoogleUser } from "../utils/arctic";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { generateAccessToken, JwtUser } from "../utils/jwt";

export class AuthController {
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
}
