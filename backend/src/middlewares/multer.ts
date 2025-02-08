import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads' ); 
    console.log('Setting upload destination to:', uploadPath);

    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
      console.log('Directory does not exist. Creating:', uploadPath);
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);  
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  },
});

// File filter to allow only images
const fileFilter = (req: any, file: any, cb: any) => {
  console.log('Checking file mimetype:', file.mimetype);
  if (file.mimetype.startsWith('image/')) {
    console.log('File is an image. Accepting upload.');
    cb(null, true);
  } else {
    console.error('File is not an image. Rejecting upload.');
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

console.log('Multer configuration completed');
export default upload;
