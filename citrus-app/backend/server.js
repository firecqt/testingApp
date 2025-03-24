const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());  // Allow cross-origin requests from frontend
app.use(express.json());  // Parse JSON request bodies

// Create a connection to MariaDB
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // use your MariaDB user
  password: 'password', // use your MariaDB password
  database: 'your_database_name', // your database name
});

// Connect to MariaDB
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ', err);
    return;
  }
  console.log('Connected to the database!');
});

// Endpoint to fetch files for a specific user
app.get('/user/:userId/files', (req, res) => {
  const userId = req.params.userId;
  
  // Query to get files for the user from the `user_files` table
  const query = 'SELECT * FROM user_files WHERE user_id = ?';
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching files: ', err);
      return res.status(500).json({ error: 'Error fetching files' });
    }

    // Send the retrieved files data as the response
    res.json(results);
  });
});

// Endpoint to upload a file (for saving files to the database)
app.post('/upload', (req, res) => {
  // Handle file upload logic here
  // You can use multer or any other file upload library for handling file uploads

  res.json({ success: true, file: { path: 'uploaded-file-path' } });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
