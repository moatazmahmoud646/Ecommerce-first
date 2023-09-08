const express  = require("express")
const app = express();
const router = express.Router()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const DB = require("./config/db")
const path = require('path')
const passport = require('passport')
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const session = require('express-session')
const bodyParser = require('body-parser');
const { createAdminUser, collection } = require('./models/User');// Load config
dotenv.config({ path: './config/config.env' })
app.use(flash());
DB()

const methodOverride = require('method-override');
const { cookie } = require("express-validator");

// Use method override middleware
router.use(methodOverride('_method'));
//createAdminUser();
// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.set('view engine', '.hbs')

const sessionstore = new MongoStore({

  mongoUrl: 'mongodb+srv://Moataz:1234@nodejsp1.wyfuncv.mongodb.net/Ecommerce?retryWrites=true&w=majority' ,
  collection : ' session',


});


// Sessions
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.MONGO_URI,}),
  })
)
// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
  // Set global var
app.use(function (req, res, next) {
    res.locals.user = req.user || null  
    next()
  })
  // Passport config
  
  const extractUserId = (req, res, next) => {
    // Extract the user ID from the request headers or session
    const userId = req.headers['user-id'] || req.session.userId;
  
    // Assign the user ID to req.userId
    req.userId = userId;
  
    // Call the next middleware function
    next();
  };

  require('./config/passport')(passport)
  // Passport middleware
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(extractUserId);
// Static folder
app.use(express.static(path.join(__dirname, 'public')))
app.use(flash());
app.use((req, res, next) => {
  //res.locals.success_msg = req.flash("success_msg");
  //res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");

  next();
});
//routers
app.use(router)
app.use('/', require('./routes/index'))
app.use('/', require('./routes/Admin'))
//app.use('/auth', require('./routes/auth'))

//server
const port= process.env.port||4000

app.listen (port,console.log(`server listen to ${port} ` ));