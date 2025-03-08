const express = require('express');
const app = express();
const port = 3000;
const axios = require('axios');

// A simple route for the root URL
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
