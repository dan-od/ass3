const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://danielookoro:Rukewwe@cluster0.jg55y.mongodb.net/WFSLapp';

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

module.exports = mongoose;
