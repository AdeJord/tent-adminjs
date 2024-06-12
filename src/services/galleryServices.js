import pool from '../dbConfig.js';
import path from "path";




export const addGalleryImage = async (request, response) => {
    if (!request.file) {
      return response.status(400).json({ error: 'No file uploaded' });
    }
  
    const file = request.file;
    const fileType = request.body.fileType;
  
    console.log('Received fileType:', fileType);
  
    try {
      const imagePath = file ? path.join('/var/www/uploads/gallery', file.filename) : null; // Store the web accessible path
  
      const query = `
        INSERT INTO gallery_images (file_path, upload_date)
        VALUES ($1, NOW())
        RETURNING *`;
  
      const values = [imagePath];
      const result = await pool.query(query, values);
      response.status(201).json({ message: `Gallery image uploaded with ID: ${result.rows[0].id}`, file: result.rows[0] });
    } catch (error) {
      console.error(error);
      response.status(500).json({
        error: "Internal Server Error. Please try again and contact support if the issue persists."
      });
    }
  };



  export const getAllGalleryImages = async (request, response) => {

    const BASE_URL = 'https://adejord.co.uk/uploads/gallery';

    try {
      console.log("Fetching gallery images from database...");
      const result = await pool.query('SELECT * FROM gallery_images ORDER BY id ASC');
  
      console.log("Query executed, processing results...");
      const images = result.rows.map(row => ({
        ...row,
        file_path: `${BASE_URL}/${path.basename(row.file_path)}`,
      }));
  
      console.log("Processed images:", images);
      response.status(200).json(images);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      response.status(500).json({ error: 'Internal Server Error' });
    }
  };

  export const editGalleryImages = async (request, response) => {
    const id = parseInt(request.params.imageId);
    const { file_path } = request.body;
    pool.query(
        'UPDATE gallery_images SET file_path = $1 WHERE id = $2 RETURNING *',
        [file_path, id],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        }
    );
}


export const getGalleryImageById = async (request, response) => {
    const id = parseInt(request.params.imageId);
    pool.query('SELECT * FROM gallery_images WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

export const deleteGalleryImageById = async (request, response) => {
  console.log('Request parameters:', request.params);  // Log the request parameters

  const galleryImageId = parseInt(request.params.galleryImageId, 10);
  console.log('Parsed gallery image ID:', galleryImageId);  // Log the parsed image ID

  if (isNaN(galleryImageId)) {
    console.error('Invalid gallery image ID:', request.params.galleryImageId);
    return response.status(400).json({ error: 'Invalid gallery image ID' });
  }

  try {
    console.log(`Attempting to delete image with ID: ${galleryImageId}`);

    const result = await pool.query('DELETE FROM gallery_images WHERE id = $1 RETURNING *', [galleryImageId]);

    if (result.rowCount === 0) {
      console.warn(`Image with ID ${galleryImageId} not found`);
      return response.status(404).json({ error: 'Image not found' });
    }

    console.log(`Image with ID ${galleryImageId} deleted successfully`);
    response.status(200).json({ message: `Image with ID ${galleryImageId} deleted successfully` });
  } catch (error) {
    console.error('Error deleting image:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};


// export const deleteGalleryImageById = async (request, response) => {
//     const id = parseInt(request.params.imageId);
//     pool.query('DELETE FROM gallery_images WHERE id = $1', [id], (error, results) => {
//         if (error) {
//             throw error;
//         }
//         response.status(200).json({ message: `Gallery image deleted with ID: ${id}` });
//     });
// }

export const updateGalleryImage = async (request, response) => {
    const id = parseInt(request.params.imageId);
    const { file_path } = request.body;
    pool.query(
        'UPDATE gallery_images SET file_path = $1 WHERE id = $2 RETURNING *',
        [file_path, id],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        }
    );
}

export const getLatestGalleryImages = async (request, response) => {
    pool.query('SELECT * FROM gallery_images ORDER BY id DESC LIMIT 3', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}


