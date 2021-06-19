const express = require('express') // server software
const mongoose = require('mongoose') //import mongoose ODM
const bodyParser = require('body-parser') // parser middleware
const path = require('path')
const url = 'mongodb://localhost/residentdb' //url for db connection
const session = require('express-session')  // session middleware
const passport = require('passport')  // authentication
const connectEnsureLogin = require('connect-ensure-login') //authorization
const logout = require('express-passport-logout')
const port = process.env.PORT || 4001


const User =  require('./model/user')

const app = express();
mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology: true})
			.then(() => console.log("db connected..."))
			.catch((err) => console.log(err))


//set view engine
app.set('views', path.join(__dirname, 'views'))
app.set("view engine", "ejs")


// Configure More Middleware
app.use(bodyParser.urlencoded({ extended: false }))

//initialize passport
app.use(passport.initialize()) 
app.use(passport.session())


app.use(session({
    secret: 'secret',
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 1000 }
}));


// To use with sessions
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const LocalStrategy = require('passport-local').Strategy //local strategy
passport.use(new LocalStrategy(User.authenticate()))



app.get('/', (req,res) => {

	res.render('home')
})

app.get('/register', (req,res) => {

	res.render(register)
})



//registers the user data and stores into DB, passport-local-mongoose takes cares of salting and hashing password

app.post('/register', function(req, res) {
      
    Users = new User({username : req.body.username});
  
          User.register(Users, req.body.password, function(err, user) {
            
            if (err) {
              res.json({success:false, message:"Your account could not be saved. Error: ", err}) 
            }

            else{
              res.json({success: true, message: "Your account has been saved"})
            }

          });
});



app.get('/login', (req,res) => {

	res.render('login');
})

app.post("/login", passport.authenticate("local"), function(req, res){
	
	res.render('secret')
})


//to fetch all the users
app.get('/getusers', (req,res) => {

  User.find({ }, (err, data) => {

      if (err)
        throw err

      res.send(data)

  })
})



//Handling user logout
app.get("/logout", function (req, res, next) {
    req.logout();
    req.session = null;
    res.redirect("/login");
});	



 
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) 
    	return next()

    res.redirect("/login")
}

app.listen(port, () => {
	console.log('server running at:' + port)
})
