// load environment variables
require('dotenv').config();

// grab our dependencies
const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    expressLayouts = require('express-ejs-layouts'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    flash = require('connect-flash'),
    expressValidator = require('express-validator'),
    server = require('http').Server(app),
    io = require('socket.io').listen(server);

io.on('connection', function (socket) {
    socket.emit('news', {hello: 'world'});
    socket.on('my other event', function (data) {
        console.log(data);
    });
});

// configure our application ===========================================================================================
// set sessions and cookie parser
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET,
    cookie: {maxAge: 60000},
    resave: false,             // forces the session to be saved back to the store
    saveUninitialized: false   // dont save unmodified
}));
app.use(flash());

// tell express where to look for static assets
app.use(express.static(__dirname + '/public'));
// JS and CSS scripts
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));    // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));          // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));  // redirect CSS bootstrap

// set ejs as our templating engine
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, function (err) {
    if (!err) {
        console.log("We are connected to MongoDB\n");
    } else {
        console.error("Error while connecting to MongoDB\n");
    }
});

// use body parser to grab info from a form
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressValidator());

// set the routes ======================================================================================================
app.use(require('./app/routes'));

// start our server ====================================================================================================
server.listen(port, function () {
    console.log('App listening on http://localhost:' + port);
});