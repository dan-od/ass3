var express = require('express');
var router = express.Router();

/* GET index page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});
/* GET home page. */
router.get('/home', function(req, res, next) {
  res.render('index', { title: 'Home' });
});
/* GET About page. */
router.get('/aboutus', function(req, res, next) {
  res.render('index', { title: 'About us' });
});
/* GET products page. */
router.get('/products', function(req, res, next) {
  res.render('index', { title: 'Products' });
});
/* GET service page. */
router.get('/service', function(req, res, next) {
  res.render('index', { title: 'Service' });
});
/* GET contactus page. */
router.get('/contactus', function(req, res, next) {
  res.render('index', { title: 'Contact Us' });
});

module.exports = router;
