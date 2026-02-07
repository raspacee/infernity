import validator from "validator";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { signupVerificationTable, usersTable } from "../db/schema";
import crypto from "crypto";
import { DateTime } from "luxon";
import nodemailer from "nodemailer";

export const sanitizeInput = (input: string) => {
  return validator.escape(validator.trim(input));
};

export const generateToken32Bytes = (): string => {
  return crypto
    .randomBytes(32)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

// export const getMailAccessToken = async (): Promise<string | null> => {
//   try {
//     const oauth2Client = new OAuth2(
//       process.env.CLIENT_ID,
//       process.env.CLIENT_SECRET,
//       "https://developers.google.com/oauthplayground"
//     );
//     oauth2Client.setCredentials({
//       refresh_token: process.env.GMAIL_REFRESH_TOKEN,
//     });
//     const accessToken = await oauth2Client.getAccessToken();
//     if (accessToken.token) return accessToken.token;
//     return null;
//   } catch (err) {
//     console.error(err);
//     return null;
//   }
// };
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

export const sendVerificationLinkToUser = async (
  email: string,
  userId: string
) => {
  /* Check if user is not verified */
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  if (result.length == 0) {
    throw new Error("User email not found");
  }

  const user = result[0];
  if (user.isVerified) throw new Error("User is already verified");

  /* 
  If old verification link exists 
  Delete the verification link first
  */
  const oldVerification = await db
    .select()
    .from(signupVerificationTable)
    .where(eq(signupVerificationTable.userId, userId))
    .limit(1);
  if (oldVerification.length > 0) {
    await db
      .delete(signupVerificationTable)
      .where(eq(signupVerificationTable.userId, userId));
  }

  /* Create verification token and link */
  const verificationTokenID = generateToken32Bytes();
  const verificationRow: typeof signupVerificationTable.$inferInsert = {
    id: verificationTokenID,
    email: email,
    expiresAt: DateTime.now().plus({ minutes: 30 }).toUTC().toISO(),
    userId: userId,
  };
  await db.insert(signupVerificationTable).values(verificationRow);

  /* Send verification mail to user */
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationTokenID}`;
  const text = `You can verify your email by going to this link: ${verificationLink}\nYou only have 30 minutes before this link expires.`;
  const mailOptions = {
    from: "khapungbj84@gmail.com",
    to: email,
    subject: "Email Verification",
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};
