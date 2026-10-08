import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `${cleanName}_${uniqueSuffix}${ext}`);
  },
});

const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|webm|ogg|mov|quicktime|m4v|mkv|avi|x-matroska/i;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype || '';

  if (allowedTypes.test(ext) || mime.startsWith('video/') || mime === 'application/octet-stream') {
    cb(null, true);
  } else {
    cb(new Error('Only video files (.mp4, .webm, .ogg, .mov, .m4v, .mkv) are allowed!'), false);
  }
};

// Avatar Upload Storage & Middleware
const avatarDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `avatar_${cleanName}_${uniqueSuffix}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|webp|gif|svg/i;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype || '';

  if (allowedTypes.test(ext) || mime.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (.jpg, .jpeg, .png, .webp, .gif) are allowed!'), false);
  }
};

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 150 * 1024 * 1024, // 150MB limit
  },
});
