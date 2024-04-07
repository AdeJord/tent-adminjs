
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// This explicitly sets the path to the project root, adjusting as necessary
const projectRootDirectory = path.resolve(__dirname, '../..');
const envPath = path.join(projectRootDirectory, '.env');

// console.log(`Attempting to load .env from: ${envPath}`);
dotenv.config({ path: envPath });




import nodemailer from 'nodemailer';

export const sendBookingConfirmationEmail = async (req, res) => {
    const formData = req.body;

    console.log(process.env.GOOGLE_EMAIL, process.env.GOOGLE_PASSWORD)

    // Create a transporter object
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465, // Or 587 if using STARTTLS
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.GOOGLE_EMAIL,
            pass: process.env.GOOGLE_PASSWORD
        }
    });



    const customerEmail = formData.email_address;
    const firstName = formData.first_name;
    const surname = formData.surname;
    const bookingDate = new Date(formData.booking_date).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'GMT',
    });
    const destination = formData.destination;
    const totalPassengers = formData.total_passengers;
    const wheelchairUsers = formData.wheelchair_users;
    const smoking = formData.smoking;
    const lunchArrangements = formData.lunch_arrangements;
    const notes = formData.notes;

    console.log(formData);

    const wheelchairUsersText = wheelchairUsers === 1 ? '1 wheelchair user' : wheelchairUsers > 1 ? `${wheelchairUsers} wheelchair users` : 'no wheelchair users';
    const mailOptionsToCustomer = {
        from: 'adejord@gmail.com',
        to: customerEmail,
        subject: 'Booking Confirmation',
        html: `<p>Hi ${firstName},</p>
        <p>Thank you for booking with us. Your booking is confirmed for ${bookingDate}.</p>
        <p>The booking is for ${totalPassengers} passengers to ${destination} with ${wheelchairUsersText}.</p>
        <p>This is a ${smoking ? 'smoking' : 'non-smoking'} trip. ${smoking ? '(Smoking is only permitted on the front deck)' : ''}</p>
        <p>We usually leave the marina at 10:30am and return at around 15:30pm.</p>
        <p>Please arrive at least 15 minutes before departure time.</p>
        <p>If there are any changes to the booking, please let us know as soon as possible.</p>
        <p>If you have any questions, please call us on 07512 896 176.</p>
        <p>See you soon!</p>
        <p>This is an automated email, please do not reply.</p>`
    };

    const mailOptionsToAdejord = {
        from: 'adejord@gmail.com',
        to: 'adejord@gmail.com',
        subject: 'New Booking',
        html: `
        <html>
        <head>
            <style>
                table {
                    border-collapse: collapse;
                    width: 50%;
                }
                th {
                    text-align: left;
                    padding: 4px 8px; /* Adjust the padding here */
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                td {
                    text-align: left;
                    padding: 2px 3px; /* Adjust the padding here */
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
                    <td>${smoking ? 'Yes' : 'No'}</td>
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
        </html>`
    };

    try {
        const resultToCustomer = await transporter.sendMail(mailOptionsToCustomer);
        console.log('Email to customer sent successfully: ', resultToCustomer);

        const resultToAdejord = await transporter.sendMail(mailOptionsToAdejord);
        console.log('Email to adejord@gmail.com sent successfully: ', resultToAdejord);

        res.send('Email sent successfully');
    } catch (error) {
        console.error('Error sending email: ', error);
        res.status(500).send('Error sending email.');
    }
};
