import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import pool from "../dbConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRootDirectory = path.resolve(__dirname, "../..");
const envPath = path.join(projectRootDirectory, ".env");
dotenv.config({ path: envPath });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Or 587 if using STARTTLS
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_PASSWORD,
  },
});

export const sendBookingConfirmationEmail = async (req, res) => {
  const formData = req.body;

  const customerEmail = formData.email_address;
  const firstName = formData.first_name;
  const surname = formData.surname;
  const bookingDate = new Date(formData.booking_date).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "GMT",
  });
  const destination = formData.destination;
  const totalPassengers = formData.total_passengers;
  const wheelchairUsers = formData.wheelchair_users;
  const smoking = formData.smoking;
  const lunchArrangements = formData.lunch_arrangements;
  const notes = formData.notes;

  const wheelchairUsersText =
    wheelchairUsers === 1
      ? "1 wheelchair user"
      : wheelchairUsers > 1
      ? `${wheelchairUsers} wheelchair users`
      : "no wheelchair users";
  const mailOptionsToCustomer = {
    from: process.env.GOOGLE_EMAIL,
    to: customerEmail,
    subject: "Booking Confirmation",
    html: `<p>Hi ${firstName},</p>
        <p>Thank you for booking with us. Your booking is confirmed for ${bookingDate}.</p>
        <p>The booking is for ${totalPassengers} passengers to ${destination} with ${wheelchairUsersText}.</p>
        <p>This is a ${smoking ? "smoking" : "non-smoking"} trip. ${
      smoking ? "(Smoking is only permitted on the front deck)" : ""
    }</p>
        <p>We usually leave the marina at 10:30am and return at around 15:30-16:00pm.</p>
        <p>Please arrive at least 15 minutes before departure time.</p>
        <p>If there are any changes to the booking, please let us know as soon as possible.</p>
        <p>If you have any questions, please call us on 07512 896 176.</p>
        <p>We look forward to seeing you!</p>
        <p>This is an automated email, please do not reply.</p>`,
  };

  const mailOptionsToAdejord = {
    from: process.env.GOOGLE_EMAIL,
    to: process.env.GOOGLE_EMAIL,
    subject: "New Booking",
    html: `
        <html>
        <head>
            <style>
                table {
                    border-collapse: collapse;
                    width: 50%;
                }
                th, td {
                    text-align: left;
                    padding: 4px 8px;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
            </style>
        </head>
        <body>
            <h2>New Booking Details</h2>
            <table>
                <tr>
                    <th>Name:</th>
                    <td>${firstName} ${surname}</td>
                </tr>
                <tr>
                    <th>Contact Number:</th>
                    <td>${formData.contact_number}</td>
                <tr>
                <tr>
                    <th>Email:</th>
                    <td>${customerEmail}</td>
                </tr>
                <tr>
                    <th>Date:</th>
                    <td>${bookingDate}</td>
                </tr>
                <tr>
                    <th>Destination:</th>
                    <td>${destination}</td>
                </tr>
                <tr>
                    <th>Total Passengers:</th>
                    <td>${totalPassengers}</td>
                </tr>
                <tr>
                    <th>Wheelchair Users:</th>
                    <td>${wheelchairUsers}</td>
                </tr>
                <tr>
                    <th>Smoking:</th>
                    <td>${smoking ? "Yes" : "No"}</td>
                </tr>
                <tr>
                    <th>Lunch Arrangements:</th>
                    <td>${lunchArrangements}</td>
                </tr>
                <tr>
                    <th>Notes:</th>
                    <td>${notes}</td>
                </tr>
            </table>
        </body>
        </html>`,
  };

  try {
    const resultToCustomer = await transporter.sendMail(mailOptionsToCustomer);
    console.log("Email to customer sent successfully: ", resultToCustomer);

    const resultToAdejord = await transporter.sendMail(mailOptionsToAdejord);
    console.log(
      "Email to adejord@gmail.com sent successfully: ",
      resultToAdejord
    );

    res.send("Email sent successfully");
  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).send("Error sending email.");
  }
};

// send all booking details to volunteers GDPR compliant
export const sendAllBookingsToVolunteersGDPRCompliant = async (req, res) => {
    const { targetMonth } = req.body;
  
    console.log("Start Sending all bookings to volunteers GDPR compliant");
    console.log("Target month:", targetMonth);
  
    try {
      // Convert month name to month number
      const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ];
      const monthNumber = monthNames.indexOf(targetMonth.toLowerCase()) + 1;
  
      if (monthNumber === 0) {
        return res.status(400).send('Invalid month name');
      }
  
      // Fetch bookings for the target month
      const bookingsResult = await pool.query(
        `SELECT * FROM bookings WHERE date_part('month', booking_date) = $1`,
        [monthNumber]
      );
  
      console.log("bookingsResult", bookingsResult);
      const bookings = bookingsResult.rows;
  
      if (bookings.length === 0) {
        return res.status(404).send('No bookings found for the specified month');
      }
  
      // Fetch volunteers with roles 'skipper' or 'crew1'
      const volunteersResult = await pool.query(
        `SELECT email_address FROM volunteers WHERE TRIM(LOWER(role)) = 'skipper' OR TRIM(LOWER(role)) = 'crew1'`
      );
      console.log("volunteersResult", volunteersResult);
  
      const volunteers = volunteersResult.rows.map((row) => row.email_address);
  
      if (volunteers.length === 0) {
        return res.status(404).send('No volunteers found with roles skipper or crew1');
      }
  
      // Define the columns for the export
      const columns = [
        "booking_date",
        "first_name",
        "surname",
        "contact_number",
        "group_name",
        "destination",
        "total_passengers",
        "wheelchair_users",
        "smoking",
        "lunch_arrangements",
        "notes",
        "skipper",
        "crew1",
        "crew2",
      ];
  
      // Generate HTML table with border collapse style
      let htmlTable = `
        <h1>Bookings for ${targetMonth}</h1>
        <table border="1" style="border-collapse: collapse">
          <tr>`;
      columns.forEach((column) => {
        htmlTable += `<th>${column.replace("_", " ")}</th>`;
      });
      htmlTable += `</tr>`;
  
      bookings.forEach((booking) => {
        htmlTable += `<tr>`;
        columns.forEach((column) => {
          let cellData = booking[column] != null ? booking[column].toString() : '';
          if (column === 'booking_date') {
            cellData = formatBookingDate(cellData);
          }
          htmlTable += `<td>${cellData}</td>`;
        });
        htmlTable += `</tr>`;
      });
      htmlTable += `</table>`;
  
      const mailOptions = {
        from: process.env.GOOGLE_EMAIL,
        to: volunteers.join(","),
        subject: `Trip List for ${targetMonth}`,
        html: htmlTable,
      };
      console.log("volunteers", volunteers);
  
      const result = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully: ", result);
      res.send("Email sent successfully");
    } catch (error) {
      console.error("Error sending email: ", error);
      res.status(500).send("Error sending email.");
    }
  
    console.log("Ending sending all bookings to volunteers GDPR compliant");
  };
  
  // Helper function for formatting the date
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  const formatBookingDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
    const month = date.toLocaleString('default', { month: 'long' });
    const dayName = date.toLocaleString('default', { weekday: 'long' });
    return `${dayName} ${day}${suffix} ${month}`;
  };