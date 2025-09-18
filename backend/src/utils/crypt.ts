import crypto from "crypto";

const algorithm = "aes-256-gcm";

const secretKey = Buffer.from(process.env.COOKIE_SECRET_KEY!, "hex");

export function encrypt(text: string) {
  const iv = crypto.randomBytes(12); // 12 bytes is standard for GCM
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64"); // combine all
}

export function decrypt(encryptedBase64: string) {
  const data = Buffer.from(encryptedBase64, "base64");

  const iv = data.slice(0, 12);
  const authTag = data.slice(12, 28);
  const encryptedText = data.slice(28);

  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
