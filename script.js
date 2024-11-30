const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const cors = require('cors');

// Allow requests from your Netlify domain
app.use(cors({
  origin: 'https://sparklyll.netlify.app', // Replace with your Netlify URL
}));


// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to get the file path
const getFilePath = (fileName) => path.join(__dirname, `${fileName}.json`);

// Helper function to ensure a file exists
const ensureFileExists = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]), 'utf8'); // Create an empty array in the new file
  }
};

// Route to add an item to a specified JSON file
app.post('/add-item', (req, res) => {
  const { fileName, id, name, price } = req.body;

  // Validate input
  if (!fileName || !id || !name || !price) {
    return res.status(400).send('File name, id, name, and price are required');
  }

  const filePath = getFilePath(fileName);
  ensureFileExists(filePath); // Ensure the file exists

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send(`Error reading file ${fileName}`);
    }

    try {
      const items = JSON.parse(data); // Parse the current items
      const newItem = { id, name, price }; // Create a new item
      items.push(newItem); // Add the new item
      fs.writeFile(filePath, JSON.stringify(items, null, 2), (writeErr) => { // Save updated items
        if (writeErr) {
          return res.status(500).send(`Error writing to file ${fileName}`);
        }
        res.status(200).send(`Item added to ${fileName} successfully`);
      });
    } catch (parseError) {
      res.status(500).send(`Error parsing JSON data in ${fileName}`);
    }
  });
});

// Route to get items from a specified JSON file
app.get('/get-items/:fileName', (req, res) => {
  const { fileName } = req.params;

  if (!fileName) {
    return res.status(400).send('File name is required');
  }

  const filePath = getFilePath(fileName);
  ensureFileExists(filePath); // Ensure the file exists

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send(`Error reading file ${fileName}`);
    }

    try {
      const items = JSON.parse(data); // Parse JSON data
      res.status(200).json(items);   // Send items as JSON
    } catch (parseError) {
      res.status(500).send(`Error parsing JSON data in ${fileName}`);
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
