var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sessions = require('express-session');
var bodyParser = require('body-parser');
///
var accountRouter = require('./routes/account');
var broadCastCommitRouter = require('./routes/broadcast_commit');
var createAccountRouter = require('./routes/create_account');
var createPostRouter = require('./routes/create_post');
var profileRouter = require('./routes/profile');
var signinRouter = require('./routes/signin');
var paymentRouter = require('./routes/payment');
var updateAccountRouter = require('./routes/update_account');
var signoutRouter = require('./routes/signout');
// var IntervalGetAllBlock = require('./lib/AsyncBlock/IntervalGetAllBlock');
// var IntervalGetAccount = require('./lib/AsyncBlock/IntervalGetAccount');

IntervalGetAccount();
// IntervalGetAllBlock();

var app = express();


app.use(sessions({
  secret: '(!)*#(!JE)WJEqw09ej12',
  resave: false,
  saveUninitialized: true
}));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

//Use authentication passport  and sessions
// var flash = require('connect-flash');
var Passport = require("./models/Passport");

// app.use(flash());
app.use(Passport.initialize());
app.use(Passport.session())

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/account', accountRouter);
app.use('/broadcast_commit', broadCastCommitRouter);
app.use('/create_account', createAccountRouter);
app.use('/create_post', createPostRouter);
app.use('/profile', profileRouter);
app.use('/payment', paymentRouter);
app.use('/signin',signinRouter);
app.use('/update_account', updateAccountRouter);
app.use('/signout', signoutRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;