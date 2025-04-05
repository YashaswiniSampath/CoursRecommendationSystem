// server.js
require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const apiRoutes = require('./routes/api'); // make sure this path is correct

const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));




app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
