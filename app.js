require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); // Middleware for cookies
const equipmentRouter = require('./routes/equipment');
const requestRouter = require('./routes/requests');
const userRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const managerRouter = require('./routes/manager');
const engineerRouter = require('./routes/engineer');
require('dotenv').config()
const app = express();

const setUser = require('./middleware/setUser');
const authenticate = require('./middleware/authenticate');

const router = require('./routes');

// Other middleware (e.g., authenticate)
router.use(authenticate);

// Add the setUser middleware
router.use(setUser);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser()); // Required for parsing cookies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (CSS, JS, etc.)

// Set views and view engine
app.set('views', path.join(__dirname, 'views')); // Ensure views directory is set
app.set('view engine', 'ejs'); // Use EJS as the templating engine

// Routes
app.use('/equipment', equipmentRouter);
app.use('/requests', requestRouter);
app.use('/users', userRouter);
app.use('/admin', adminRouter);
app.use('/manager', managerRouter);
app.use('/engineer', engineerRouter);

// Default Route
app.get('/', (req, res) => {
  res.redirect('/users/login'); // Redirect to the login page
});

// 404 Handling
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' }); // Custom 404 page
});

module.exports = app;
