var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
///
var accountRouter = require('./routes/account');
var broadCastCommitRouter = require('./routes/broadcast_commit');
var createAccountRouter = require('./routes/create_account');
var createPostRouter = require('./routes/create_post');
var profileRouter = require('./routes/profile');
var paymentRouter = require('./routes/payment');
//
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/account', accountRouter);
app.use('/broadcast_commit', broadCastCommitRouter);
app.use('/create_account', createAccountRouter);
app.use('/create_post', createPostRouter);
app.use('/profile', profileRouter);
app.use('/payment', paymentRouter);


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