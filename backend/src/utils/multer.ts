import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1000 },
  fileFilter: (_, file, cb) => {
    const valid = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ].includes(file.mimetype);

    if (!valid) {
      cb(new Error("Only pdf is supported"));
    } else {
      cb(null, true);
    }
  },
});
