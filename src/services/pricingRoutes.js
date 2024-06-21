import express from 'express';
import { getAllPrices, updatePrices } from './pricingServices.js';

export const pricingRoutes = express.Router();

pricingRoutes.get('/prices', async (req, res) => {
  try {
    const prices = await getAllPrices();
    res.status(200).json(prices);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

pricingRoutes.patch('/prices/:id', async (req, res) => {
  const { id } = req.params;
  const { trip1, trip2, trip3, trip4, trip5, trip6 } = req.body;

  try {
    const updatedRows = await updatePrices(id, trip1, trip2, trip3, trip4, trip5, trip6);
    if (updatedRows > 0) {
      res.status(200).json({ message: 'Prices updated successfully' });
    } else {
      res.status(404).json({ error: 'Price not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default pricingRoutes;
