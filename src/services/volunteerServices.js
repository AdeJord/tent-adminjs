// volunteerService.js
import pool from '../dbConfig.js';

export const addVolunteers = async (request, response) => {
    const {
        first_name,
        surname,
        contact_number,
        email_address,
        house_number,
        street_name,
        city,
        postcode,
        role,
        notes,
    } = request.body;

    try {
        const query = `
            INSERT INTO volunteers
            (first_name, surname, contact_number, email_address, house_number, street_name, city, postcode, role, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`;

        const values = [
            first_name,
            surname,
            contact_number,
            email_address,
            house_number,
            street_name,
            city,
            postcode,
            role,
            notes,
        ];

        const result = await pool.query(query, values);

        console.log(`Volunteer added with ID: ${result.rows[0].id}`);
        response.status(201).json({ message: `Volunteer added with ID: ${result.rows[0].id}` });
    } catch (error) {
        console.error("Error creating volunteer:", error);
        response.status(500).json({ error: "Internal Server Error try again and call Ade if not working" });
    }

}

export const getAllVolunteers = async (request, response) => {
    pool.query('SELECT * FROM volunteers ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

export const updateVolunteer = async (request, response) => {
    const {
        first_name,
        surname,
        contact_number,
        email_address,
        house_number,
        street_name,
        city,
        postcode,
        role,
        notes,
    } = request.body;

    try {
        const query = `
            UPDATE volunteers
            SET first_name = $1, surname = $2, contact_number = $3, email_address = $4, house_number = $5, street_name = $6, city = $7, postcode = $8, role = $9, notes = $10
            WHERE id = $11
            RETURNING *`;

        const values = [
            first_name,
            surname,
            contact_number,
            email_address,
            house_number,
            street_name,
            city,
            postcode,
            role,
            notes,
            request.params.volunteerId,
        ];

        const result = await pool.query(query, values);

        console.log(`Volunteer updated with ID: ${result.rows[0].volunteerId}`);
        response.status(201).json({ message: `Volunteer updated with ID: ${result.rows[0].volunteerId}` });
    } catch (error) {
        console.error("Error updating volunteer:", error);
        response.status(500).json({ error: "Internal Server Error try again and call Ade if not working" });
    }
}

export const deleteVolunteer = async (request, response) => {       
    const { volunteerId } = request.params;

    try {
        const result = await pool.query('DELETE FROM volunteers WHERE id = $1', [volunteerId]); // Use 'await' to wait for the query result
        console.log("Deleted id", volunteerId);

        if (result.rowCount === 0) {
            // No rows were affected, which means the volunteer was not found.
            response.status(404).json({ message: "No volunteer found with the given ID" });
            return;
        }

        console.log("result", result.rows[0]);
        response.status(200).json({ message: "Volunteer deleted successfully" });
    } catch (error) {
        console.error("Error finding volunteer:", error);
        response.status(500).json({ error: "Internal Server Error try again and call Ade if not working" });
    }
}

export const getVolunteerById = async (request, response) => {
    const { volunteerId } = request.params;
    console.log("id", volunteerId);
    try {
        const result = await pool.query('SELECT * FROM volunteers WHERE id = $1', [volunteerId]); // Use 'await' to wait for the query result

        if (result.rows.length === 0) {
            response.status(404).json({ message: "No volunteer found with the given ID" });
            return;
        }

        console.log("result", result.rows[0]);
        response.status(200).json(result.rows[0]); // Send only this response when a volunteer is found
        
    } catch (error) {
        console.error("Error finding volunteer:", error);
        response.status(500).json({ error: "Internal Server Error try again and call Ade if not working" });
    }
};

