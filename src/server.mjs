// Initialize dotenv
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import multer from "multer";
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from './dbConfig.js';

//SENDS IMAGES TO DOCS FOLDER! NEED VALIDATION!


// Define a mapping of file types to file names
const fileNameMapping = {
  groupLeaderPolicy: 'Group-Leader-Policy',
  TCs: 'Terms-and-Conditions', // checked and working
  boatBrochure: 'Boat-Brochure',
  riskAssessments: 'Risk-Assessment', // checked and working
  HagPoster: 'HAG-Poster',
  bookingConditions: 'Booking-Conditions',
  insuranceCertificate: 'Insurance-Certificate',  // checked and working
};

// Set up storage options with Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      let uploadsPath;
      if (file.mimetype.startsWith('image/') && req.body.fileType === 'newsImage') {
          uploadsPath = '/var/www/uploads/news-images'; // Correct directory
      } else if (file.mimetype.startsWith('image/') && req.body.fileType === 'galleryImages') {
          uploadsPath = '/var/www/uploads/gallery'; // Adjust if needed
      } else {
          uploadsPath = '/var/www/uploads/docs'; // Default for other files
      }

      if (!fs.existsSync(uploadsPath)) {
          fs.mkdirSync(uploadsPath, { recursive: true });
      }

      cb(null, uploadsPath);
  },
  // Renaming the file works
  filename: function (req, file, cb) {
      // Get the desired new name from the mapping, if it exists, otherwise default to the original name
      const newName = fileNameMapping[req.body.fileType];
      if (newName) {
          const extension = file.originalname.split('.').pop(); // Get file extension from original file name
          cb(null, `${newName}.${extension}`);
      } else {
          cb(null, file.originalname); // Fallback to original file name if not specified in mapping
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




// Check if the uploads directory exists, and create it if it doesn't
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
}

const app = express();
const port = 3000;

// Import bookingServices
import { 
  getAllBookings, 
  createBooking, 
  updateBooking,
  deleteBooking, 
  getBookingById, 
  getAllDates,
} from './services/bookingServices.js';

// import volunteerServices
import {
  addVolunteers,
  getAllVolunteers,
  updateVolunteer,
  deleteVolunteer,
  getVolunteerById,
} from './services/volunteerServices.js';

// import newsServices
import {
  addNews,
  getAllNews,
  getNewsById,
  deleteNews,
  getLatestNews,
  updateNews
} from './services/newsServices.js';

// uploadServices
import { 
  saveFileUpload
 } from './services/uploadServices.js';

import { 
  sendBookingConfirmationEmail 
} from './services/emailServices.js';


var allowedOrigins = [
  'https://tent-admin2.netlify.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://tent-admin.netlify.app',
  'https://tent-site2.netlify.app'
];

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 50000 }));

app.use('/uploads/docs', express.static(path.join(__dirname, 'uploads', 'docs')));
app.use('/uploads/news-images', express.static('/var/www/uploads/news-images'));
app.use('/uploads/gallery', express.static('/var/www/uploads/gallery'));


// make the uploads directory available to the public
app.use('/uploads', express.static(uploadsDir));

// Define routes
app.get('/', (req, res) => {
  res.send('Application works!');
});

// Booking routes...
app.get('/bookings', getAllBookings); //works
app.get('/dates', getAllDates); //works
app.post('/createBooking', createBooking); //works 
app.patch('/updateBooking/:bookingId', updateBooking);
app.delete('/deleteBooking/:bookingId', deleteBooking);
app.get('/getBookingById/:bookingId', getBookingById);
app.post('/sendBookingConfirmationEmail', sendBookingConfirmationEmail);
app.get('/bookings/:bookingId', getBookingById);

// Volunteer routes
app.post('/addVolunteers', addVolunteers);
app.get('/volunteers', getAllVolunteers);
app.patch('/updateVolunteer/:volunteerId', updateVolunteer);
app.delete('/deleteVolunteer/:volunteerId', deleteVolunteer);
app.get('/getVolunteerById/:volunteerId', getVolunteerById);

// News routes
app.post('/addNews', upload.single('image'), addNews);
app.get('/news', getAllNews);
app.get('/news/:newsId', getNewsById);
app.delete('/news/:newsId', deleteNews);
app.get('/getLatestNews', getLatestNews);
app.patch('/updateNews/:newsId', updateNews);

//check if filetype is present
app.use((req, res, next) => {
  // console.log('req.body = ', req.body); // Log the body to see if fileType is present
  // seems its not present?!?!
  next();
});

// Upload file route
app.post('/uploadFile', upload.any(), (req, res) => {
  if (req.files && req.files.length > 0) {
    const file = req.files[0];  // Assuming single file upload for simplicity
    const fileType = req.body.fileType;
    console.log('File uploaded:', file);
    console.log('FileType:', fileType);
    res.status(201).send({ message: 'File uploaded successfully', path: file.path });
  } else {
    res.status(400).send({ error: 'No files were uploaded.' });
  }
});

//Registration endpoint. 
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);  // Salt rounds = 10
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    res.status(201).send(result.rows[0]);
  } catch (error) {
    res.status(500).send({ error: 'Failed to register user' });
    console.error('Failed to register user:', error);
  }
});

//Login endpoint
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




//ALSO NEED
// Upload T&C's s 
// Upload Group Leader Policys 
// Upload Boat Brochures
// Upload Risk Assemessmentss
// Upload HAG posters
// Upload Booking Conditions
// Upload Insurance Certificate




// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


