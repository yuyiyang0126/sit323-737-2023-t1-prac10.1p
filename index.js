const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Connection URL
const mongo_host = process.env.MONGO_HOST || 'localhost';
const mongo_port = process.env.MONGO_PORT || 32100;
const mongo_username = process.env.MONGO_USERNAME || 'admin';
const mongo_password = process.env.MONGO_PASSWORD || 'admin';
const mongo_database = process.env.MONGO_DATABASE || 'test';

// Connection string
const mongo_url = `mongodb://${mongo_username}:${mongo_password}@${mongo_host}:${mongo_port}/${mongo_database}`;

// Connect to MongoDB
mongoose.connect(mongo_url, { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB', err);
  });

// Create schema for calculation
const calculationSchema = new mongoose.Schema({
  calculation: String,
  n1: Number,
  n2: Number,
  result: Number
});

// Create calculation model
const Calculation = mongoose.model('Calculation', calculationSchema);

// Middleware for parsing JSON
app.use(bodyParser.json());

// Endpoint for health check
app.get('/', (req, res) => {
  res.send('Microservice running, Ready to calculate');
});

// Endpoint for calculating
app.post('/calculate', (req, res) => {
  const { calculation, n1, n2 } = req.body;

  // Catching Error
  if (isNaN(n1) || isNaN(n2)) {
    res.status(400).send('Invalid inputs!');
    return;
  }

  let result;

  switch (calculation) {
    case 'add':
      result = n1 + n2;
      break;
    case 'subtract':
      result = n1 - n2;
      break;
    case 'multiply':
      result = n1 * n2;
      break;
    case 'divide':
      result = n1 / n2;
      break;
    default:
      res.status(400).send('Invalid calculation');
      return;
  }

  // Save calculation to MongoDB
  const calculationObj = new Calculation({
    calculation,
    n1,
    n2,
    result
  });

  calculationObj.save((err, calculation) => {
    if (err) {
      console.log('Error saving calculation', err);
    }
    console.log('Calculation saved', calculation);
  });

  res.json({ result });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Calculator Microservice is listening at http://0.0.0.0:${port}`);
});
