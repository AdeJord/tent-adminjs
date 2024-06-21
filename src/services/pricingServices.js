import express from 'express';
import pool from "../dbConfig.js";

const router = express.Router();

// Function to get all prices
export const getAllPrices = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM prices');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to update prices
export const updatePrices = async (req, res) => {
  const id = parseInt(req.params.id);
  const { trip1, trip2, trip3, trip4, trip5, trip6 } = req.body;

  const query = `
    UPDATE prices
    SET trip1 = $1, trip2 = $2, trip3 = $3, trip4 = $4, trip5 = $5, trip6 = $6
    WHERE id = $7
    RETURNING *;
  `;
  const values = [trip1, trip2, trip3, trip4, trip5, trip6, id];

  try {
    const { rows } = await pool.query(query, values);
    res.status(200).json(rows[0]); // returns the updated row
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Error updating prices' });
  }
};

// Define routes
router.get('/prices', getAllPrices); // GET request for getting all prices
router.put('/prices/:id', updatePrices); // PUT request for updating prices

export default router;
