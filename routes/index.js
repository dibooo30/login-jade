var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', ensureAuthenticeted, function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.render('index', {title:'index'});

});

function ensureAuthenticeted(req, res, next){
  if( req.isAuthenticated() ){
     return next();
  }
  res.redirect('/users/login');
}

module.exports = router;
