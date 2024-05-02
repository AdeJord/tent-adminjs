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


// Set up storage options with Multer



const fileNameMapping = {
  groupLeaderPolicy: 'Group-Leader-Policy', //works
  TCs: 'Terms-and-Conditions', //works
  boatBrochure: 'Boat-Brochure',//works
  riskAssessments: 'Risk-Assessment',//works
  HagPoster: 'HAG-Poster',//works
  bookingConditions: 'Booking-Conditions',//works
  insuranceCertificate: 'Insurance-Certificate',//works
};


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      let uploadsPath = path.join(__dirname, 'uploads', 'docs'); // Default to docs

      if (file.mimetype.startsWith('image/')) {
          if (req.body.fileType === 'galleryImages') {
              uploadsPath = path.join(__dirname, 'uploads', 'gallery');
          } else if (req.body.fileType === 'newsImage') { // For news images
              uploadsPath = path.join(__dirname, 'uploads', 'news-images');
          }
      }

      // Ensure the directory exists
      if (!fs.existsSync(uploadsPath)) {
          fs.mkdirSync(uploadsPath, { recursive: true });
      }

      cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
      const directory = file.mimetype.startsWith('image/') ? path.join(__dirname, 'uploads', 'gallery')
                        : path.join(__dirname, 'uploads', 'docs');

      if (file.mimetype.startsWith('image/')) {
          // Directory for images, specific or general
          const targetDir = req.body.fileType === 'newsImage' ? 'news-images' : 'gallery';
          const imageDirectory = path.join(__dirname, 'uploads', targetDir);
          
          fs.readdir(imageDirectory, (err, files) => {
              if (err) {
                  console.error('Error reading directory:', err);
                  cb(err);
              } else {
                  const fileExtension = path.extname(file.originalname);
                  let fileNumber = files.filter(f => f.startsWith("Image")).length + 1;
                  const fileName = `Image-${fileNumber}${fileExtension}`;
                  cb(null, fileName);
              }
          });
      } else {
          // PDFs or other document types
          const fileExtension = path.extname(file.originalname);
          let baseName = req.body.fileType.replace(/[^a-zA-Z0-9]/g, '-');
          const fileName = `${baseName}${fileExtension}`;
          cb(null, fileName);
      }
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


// OLD SERVER CODE 
// import dotenv from 'dotenv';
// import https from 'https';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import http from 'http';
// import fs from 'fs';
// import express from 'express';
// import cors from 'cors'
// import bodyParser from 'body-parser';
// import { 
//   getAllBookings,
//   createBooking,
//   updateBooking,
//   deleteBooking,
//   getBookingById,
//   getAllDates

// } from './services/bookingServices.js';

// dotenv.config();

// import pool from './dbConfig.js'

// // Get the file URL for the current module
// const __filename = fileURLToPath(import.meta.url);
// // Get the directory name from the file URL
// const __dirname = dirname(__filename);

// // Convert the database password to a string
// const password = process.env.DB_PASSWORD; // Convert password to a string



// const app = express();
// const port = 3000;

// var allowedOrigins = [
//     '*', // Allow from anywhere for now
//     'https://tent-admin2.netlify.app',
//     'http://localhost:3000',
//     'https://tent-admin.netlify.app',
//     'https://tent-site2.netlify.app'
//   ];

// // Set up CORS middleware
// app.use(
//     cors({
//       origin: function (origin, callback) {
//         // Allow requests with no origin (like mobile apps, curl requests)
//         if (!origin) return callback(null, true);
  
//         // Only allow origins from the allowedOrigins list
//         if (allowedOrigins.indexOf(origin) !== -1) {
//           callback(null, true);
//         } else {
//           var msg = 'The CORS policy for this site does not ' +
//                     'allow access from the specified Origin.';
//           return callback(new Error(msg), false);
//         }
//       },
//       credentials: true,
//     })
//   );// Set up body-parser middleware to handle JSON and URL-encoded bodies
//   app.use(bodyParser.json());
//   app.use(bodyParser.urlencoded({ extended: true }));

//   app.get('/', (req, res) => {
//     res.send('Application works!');
//   });

//   //OTHER ROUTES HERE
// app.get('/bookings', getAllBookings);// working on postman, locally and from adejord
// app.get('/dates', getAllDates);// working on postman, locally and from adejord
// app.post('/createBooking', createBooking);
// app.put('/updateBooking/:id', updateBooking);
// app.delete('/deleteBooking/:id', deleteBooking);
// app.get('/getBookingById/:id', getBookingById);


// // Load SSL/TLS certificate and private key
// // const privateKey = fs.readFileSync('src/privkey.pem', 'utf8');
// // const certificate = fs.readFileSync('src/fullchain.pem', 'utf8');
// const privateKey = fs.readFileSync(`${__dirname}/privkey.pem`, 'utf8');
// const certificate = fs.readFileSync(`${__dirname}/fullchain.pem`, 'utf8');

// const credentials = { key: privateKey, cert: certificate };

// // Create HTTPS server
// // const httpsServer = https.createServer(credentials, app);



// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });
