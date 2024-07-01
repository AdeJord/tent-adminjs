import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from './dbConfig.js';
import pricingRoutes from './services/pricingRoutes.js';
import router from './services/pricingRoutes.js';

import { 
  getAllBookings, 
  createBooking, 
  updateBooking,
  deleteBooking, 
  getBookingById, 
  getAllDates,
} from './services/bookingServices.js';

import {
  addVolunteers,
  getAllVolunteers,
  updateVolunteer,
  deleteVolunteer,
  getVolunteerById,
} from './services/volunteerServices.js';

import {
  addNews,
  getAllNews,
  getNewsById,
  deleteNews,
  getLatestNews,
  updateNews
} from './services/newsServices.js';

import { 
  saveFileUpload,
 } from './services/uploadServices.js';

import {
  getAllGalleryImages,
  editGalleryImages,
  getGalleryImageById,
  deleteGalleryImageById,
  addGalleryImage
} from './services/galleryServices.js';

import {
  getAllPrices,
  updatePrices
} from './services/pricingServices.js';

// import {
//   pricingRoutes
// } from './services/pricingRoutes.js';

import { 
  sendBookingConfirmationEmail,
  sendAllBookingsToVolunteersGDPRCompliant 
} from './services/emailServices.js';

dotenv.config();

const fileNameMapping = {
  groupLeaderPolicy: 'Group-Leader-Policy',
  TCs: 'Terms-and-Conditions',
  boatBrochure: 'Boat-Brochure',
  riskAssessments: 'Risk-Assessment',
  HagPoster: 'HAG-Poster',
  bookingConditions: 'Booking-Conditions',
  insuranceCertificate: 'Insurance-Certificate',
  galleryImages: 'Gallery-Image',
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadsPath;
    if (file.mimetype.startsWith('image/') && req.body.fileType === 'newsImage') {
      uploadsPath = '/var/www/uploads/news-images';
    } else if (file.mimetype.startsWith('image/') && req.body.fileType === 'galleryImages') {
      uploadsPath = '/var/www/uploads/gallery';
    } else {
      uploadsPath = '/var/www/uploads/docs';
    }

    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    const newName = fileNameMapping[req.body.fileType];
    if (newName) {
      const extension = file.originalname.split('.').pop();
      cb(null, `${newName}-${Date.now()}.${extension}`);
    } else {
      cb(null, file.originalname);
    }
  }
});

const upload = multer({ storage: storage });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, 'uploads');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
}

const app = express();
const port = 3000;

// const allowedOrigins = [
//   'https://tent-admin2.netlify.app',
//   'http://localhost:3000',
//   'http://localhost:3001',
//   'http://localhost:3002',
//   'https://tent-admin.netlify.app',
//   'https://tent-site2.netlify.app'
// ];

// Prices routes
router.get('/prices', getAllPrices); // GET request for getting all prices
router.patch('/prices/:id', updatePrices); // PATCH request for updating prices

app.use(bodyParser.json({ limit: '50mb' }));
app.use('/api', pricingRoutes);
app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 50000 }));

app.use('/uploads/docs', express.static(path.join(__dirname, 'uploads', 'docs')));
app.use('/uploads/news-images', express.static('/var/www/uploads/news-images'));
app.use('/uploads/gallery', express.static('/var/www/uploads/gallery'));

app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
  res.send('Application works!');
});

// Booking Routes
app.get('/bookings', getAllBookings);
app.get('/dates', getAllDates);
app.post('/createBooking', createBooking);
app.patch('/updateBooking/:bookingId', updateBooking);
app.delete('/deleteBooking/:bookingId', deleteBooking);
app.get('/getBookingById/:bookingId', getBookingById);
app.get('/bookings/:bookingId', getBookingById);

// Volunteer Routes
app.post('/addVolunteers', addVolunteers);
app.get('/volunteers', getAllVolunteers);
app.patch('/updateVolunteer/:volunteerId', updateVolunteer);
app.delete('/deleteVolunteer/:volunteerId', deleteVolunteer);
app.get('/getVolunteerById/:volunteerId', getVolunteerById);

// News Routes
app.post('/addNews', upload.single('image'), addNews);
app.get('/news', getAllNews);
app.get('/news/:newsId', getNewsById);
app.delete('/news/:newsId', deleteNews);
app.get('/getLatestNews', getLatestNews);
app.patch('/updateNews/:newsId', updateNews);

// Email Routes
app.post('/send-booking-confirmation', sendBookingConfirmationEmail);
app.post('/send-all-bookings-GDPR', sendAllBookingsToVolunteersGDPRCompliant);

// Gallery Routes
app.post('/addGalleryImage', upload.single('image'), addGalleryImage);
app.get('/galleryImages', getAllGalleryImages);
app.delete('/galleryImages/:galleryImageId', deleteGalleryImageById);

// Prices Routes
app.get('/prices', getAllPrices);
app.patch('/updatePrices/:id', updatePrices);

app.post('/upload', upload.single('file'), saveFileUpload);

app.use((req, res, next) => {
  next();
});

app.post('/uploadFile', upload.any(), (req, res) => {
  if (req.files && req.files.length > 0) {
    const file = req.files[0];
    const fileType = req.body.fileType;
    console.log('File uploaded:', file);
    console.log('FileType:', fileType);
    res.status(201).send({ message: 'File uploaded successfully', path: file.path });
  } else {
    res.status(400).send({ error: 'No files were uploaded.' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      const isValid = await bcrypt.compare(password, result.rows[0].password);
      if (isValid) {
        const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.send({ token });
      } else {
        res.status(401).send({ error: 'Invalid credentials' });
      }
    } else {
      res.status(404).send({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Failed to login' });
    console.error('Login error:', error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
