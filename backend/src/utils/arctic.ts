import * as arctic from "arctic";

export type GoogleUser = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
  email: string;
  email_verified: boolean;
};

export const google = new arctic.Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.OAUTH2_REDIRECT_URI!
);
