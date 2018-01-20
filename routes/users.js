var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'./uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../modules/users');

// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('openUri', function() {
//   // we're connected!
// });

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', {title:'register'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title: 'login'});
});
router.get('/logout', function (req, res, next) {
  req.logout();
  req.flash('login-done', 'you are loggout');
  res.redirect('/users/login');
});
router.post('/login',
  passport.authenticate('local', {failureRedirect:'/users/login', failureFlash:'invaled username or password'}),
  function(req, res, next) {
            req.flash('login-done', 'welcome  ' + req.body.username);
            res.redirect('/');
            res.render('/', {name:req.body.username});
      });

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new LocalStrategy(function(username, password, done) {
  User.getUserByUsername(username, function(err, user) {
    if(err) throw err;
    if(!user){

      return done(null, false, {message: 'unknown user'});
    }
// to compare password with user password
    User.comparePassword(password, user.password, function(err, isMatch) {
      if(err) return done(err);
      if(isMatch){
        return done(null, user);
      } else {
        return done(null, false,  {message: 'invaled password'});
      }
    });
  });
}));

router.post('/register', upload.single('image'), function(req, res, next) {

  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

 if(req.file){
   console.log('uploding now....');
 } else {
   console.log('no file uploding');
 }
 req.checkBody('email', 'Email is required and must be an email').isEmail();
 req.checkBody('email', 'Email is required.').notEmpty();
 req.checkBody('username', 'username is required.').notEmpty();
 req.checkBody('password', 'password is required.').notEmpty();
 req.checkBody('password2', 'your re pass is not equals password field').equals(req.body.password);


 var errors = req.validationErrors();

 if(errors){
  res.render('register', {errors: errors});
  } else{
   console.log('no errors');
   var newUser = new User({
     username:username,
     email:email,
     password:password
   });
   User.createUser(newUser, function(err, user) {
     if(err) throw err;
     console.log(user);
   });

    req.flash("login-done", "log in success");
   
   res.location('/');
   res.redirect('/users/login');
 }

});

module.exports = router;

