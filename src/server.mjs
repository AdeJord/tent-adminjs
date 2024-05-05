// Initialize dotenv
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import multer from "multer";
import bodyParser from 'body-parser';


//SENDS IMAGES TO DOCS FOLDER! NEED VALIDATION!


// Define a mapping of file types to file names
const fileNameMapping = {
  groupLeaderPolicy: 'Group-Leader-Policy', //works
  TCs: 'Terms-and-Conditions', //works
  boatBrochure: 'Boat-Brochure',//works
  riskAssessments: 'Risk-Assessment',//works
  HagPoster: 'HAG-Poster',//works
  bookingConditions: 'Booking-Conditions',//works
  insuranceCertificate: 'Insurance-Certificate',//works
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
  filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name
  }
});

const upload = multer({ storage: storage });
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, 'uploads');



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

// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//   }
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   next();
// });

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


