import pool from '../dbConfig.js';


export const saveFileUpload = async (request, response) => {
  if (!request.file) {
    return response.status(400).json({ error: 'No file uploaded' });
  }

  const { fileType } = request.body;
  const file = request.file;

console.log('file', file)

  try {
    const filePath = file ? file.path : null;
    const normalizedFilePath = filePath ? filePath.replace(/\\/g, '/') : null;

    const query = `
      INSERT INTO file_uploads
      (file_type, file_path, upload_date)
      VALUES ($1, $2, NOW())
      RETURNING *`;

    const values = [fileType, normalizedFilePath];
    const result = await pool.query(query, values);
    response.status(201).json({ message: `File uploaded with ID: ${result.rows[0].id}`, file: result.rows[0] });
  } catch (error) {
    console.error(error);
    response.status(500).json({
      error: "Internal Server Error. Please try again and contact support if the issue persists."
    });
  }
};
