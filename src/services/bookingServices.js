// bookingService.js
import pool from '../dbConfig.js';

import getMonthNameFromDate from "../utils/dateToMonth.js"; // Assuming this is a utility function you have

export const createBooking = async (request, response) => {
  
  const {
    first_name,
    surname,
    group_name,
    contact_number,
    email_address,
    house_number,
    street_name,
    city,
    postcode,
    booking_date,
    total_passengers,
    wheelchair_users,
    smoking,
    destination,
    lunch_arrangements,
    notes,
    terms_and_conditions,
    group_leader_policy,
  } = request.body;

   // Converting total_passengers and wheelchair_users to integers
  //  total_passengers = parseInt(total_passengers, 10);
  //  wheelchair_users = parseInt(wheelchair_users, 10);

  try {
    const myDate = new Date(booking_date);
    const bookingMonth = getMonthNameFromDate(myDate);

    const query = `
            INSERT INTO bookings
            (first_name, surname, group_name, contact_number, email_address, house_number, street_name, city, postcode, booking_date, total_passengers, wheelchair_users, smoking, destination, lunch_arrangements, notes, terms_and_conditions, group_leader_policy, bookingMonth)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING *`;

    const values = [
      first_name,
      surname,
      group_name,
      contact_number,
      email_address,
      house_number,
      street_name,
      city,
      postcode,
      booking_date,
      total_passengers,
      wheelchair_users,
      smoking,
      destination,
      lunch_arrangements,
      notes,
      terms_and_conditions,
      group_leader_policy,
      bookingMonth,
    ];

    const result = await pool.query(query, values);

    console.log(
      `Booking added with ID: ${result.rows[0].id} in ${bookingMonth}`
    );
    response
      .status(201)
      .json({ message: `Booking added with ID: ${result.rows[0].id}` });
  } catch (error) {
    console.error("Error creating booking:", error);
    response
      .status(500)
      .json({
        error: "Internal Server Error try again and call Ade if not working",
      });
  }
};

export const getAllBookings = async (req, res) => {
    try {
      const results = await pool.query("SELECT * FROM bookings ORDER BY id ASC");
      res.status(200).json(results.rows);
    } catch (error) {
      console.error("Error getting all bookings:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

export const updateBooking = async (request, response) => {
  const {
    first_name,
    surname,
    group_name,
    contact_number,
    email_address,
    house_number,
    street_name,
    city,
    postcode,
    booking_date,
    total_passengers,
    wheelchair_users,
    smoking,
    destination,
    lunch_arrangements,
    notes,
    terms_and_conditions,
    group_leader_policy,
  } = request.body;

  try {
    const myDate = new Date(booking_date);
    const bookingMonth = getMonthNameFromDate(myDate);

    const query = `
            UPDATE bookings
            SET first_name = $1, surname = $2, group_name = $3, contact_number = $4, email_address = $5, house_number = $6, street_name = $7, city = $8, postcode = $9, booking_date = $10, total_passengers = $11, wheelchair_users = $12, smoking = $13, destination = $14, lunch_arrangements = $15, notes = $16, terms_and_conditions = $17, group_leader_policy = $18, bookingMonth = $19
            WHERE id = $20
            RETURNING *`;

    const values = [
      first_name,
      surname,
      group_name,
      contact_number,
      email_address,
      house_number,
      street_name,
      city,
      postcode,
      booking_date,
      total_passengers,
      wheelchair_users,
      smoking,
      destination,
      lunch_arrangements,
      notes,
      terms_and_conditions,
      group_leader_policy,
      bookingMonth,
      request.params.id,
    ];

    const result = await pool.query(query, values);

    console.log(
      `Booking updated with ID: ${result.rows[0].id} in ${bookingMonth}`
    );
    response
      .status(201)
      .json({ message: `Booking updated with ID: ${result.rows[0].id}` });
  } catch (error) {
    console.error("Error updating booking:", error);
    response
      .status(500)
      .json({
        error: "Internal Server Error try again and call Ade if not working",
      });
  }
};

export const deleteBooking = async (request, response) => {
    const { bookingId } = request.params;

    try {
        const result = await pool.query('DELETE FROM bookings WHERE id = $1', [bookingId]); // Use 'await' to wait for the query result
        console.log("Deleted id", bookingId);

        if (result.rowCount === 0) {
            // No rows were affected, which means the booking was not found.
            response.status(404).json({ message: "No booking found with the given ID" });
            return;
        }

        console.log("result", result.rows[0]);
        response.status(200).json({ message: "Booking deleted successfully" });
        } catch (error) {
        console.error("Error finding booking:", error);
        response.status(500).json({ error: "Internal Server Error try again and call Ade if not working" });
    }
}

export const getBookingById = async (request, response) => {
    const { bookingId } = request.params;
    console.log("id", bookingId);

  // function to log the type of data of the id
  // const logType = (bookingId) => {
  //   console.log(typeof bookingId);
  // };
  // { logType(data[0].bookingId) }  // ???

    try {
        const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]); // Use 'await' to wait for the query result

        if (result.rows.length === 0) {
            response.status(404).json({ message: "No booking found with the given ID" });
            return;
        }

        console.log("result", result.rows[0]);
        response.status(200).json(result.rows[0]); // Send only this response when a booking is found


    } catch (error) {
        console.error("Error finding booking:", error);
        response.status(500).json({ error: "Internal Server Error try again and call Ade if not working" });
    }
}

export const getAllDates = async (request, response) => {
    pool.query('SELECT TO_CHAR(booking_date, \'YYYY-MM-DD\') AS formatted_date FROM bookings ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows.map((row) => row.formatted_date));
    });
}
