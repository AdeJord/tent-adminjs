// Initialize dotenv
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import multer from "multer";

import bodyParser from 'body-parser';

// Set up storage options with Multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      const uploadsPath = path.join(__dirname, 'uploads/');
      // Ensure the directory exists
      if (!fs.existsSync(uploadsPath)) {
          fs.mkdirSync(uploadsPath, { recursive: true });
          console.log(`Created directory at: ${uploadsPath}`);
      }
      cb(null, uploadsPath);
  },
  filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, 'uploads');
const upload = multer({ storage: storage });  // Use the custom storage configuration


// Check if the uploads directory exists, and create it if it doesn't
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
}

const app = express();
const port = 3000;



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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
} from './services/newsServices.js';

import { sendBookingConfirmationEmail } from './services/emailServices.js';
import pool from './dbConfig.js';



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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
// Your Express route
// app.post('/addNews', upload.single('image'), (req, res) => {
//   console.log(req.file);  // Logs the uploaded file information
//   console.log(req.body);  // Logs non-file form fields
//   res.send('File upload received!');
// });
app.get('/news', getAllNews);
app.get('/news/:newsId', getNewsById);
app.delete('/news/:newsId', deleteNews);
app.get('/getLatestNews', getLatestNews);



//ALSO NEED
// Upload T&C's
// Upload Group Leader Policy
// Upload Boat Brochure
// Upload Risk Assemessments
// Upload HAG poster
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
