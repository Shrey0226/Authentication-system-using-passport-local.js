if ( process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const users = []
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initializepassprt = require("./passport-config");
const method_override = require("method-override")
initializepassprt(passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id == id))

app.set('view-engine', "ejs")
app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.session());
app.use(passport.initialize());
app.use(method_override('_method'))


app.get("/", checkAuthenticated, (req, res) =>{
    res.render('index.ejs',{name: req.user.name});
});
app.get("/login", checkNotAuthenticated, (req, res) =>{
    res.render('login.ejs');
});
app.get("/register", checkNotAuthenticated, (req, res) =>{
    res.render('register.ejs');
});
app.post("/register", checkNotAuthenticated, async(req, res) =>{
    try{
        const hashedpassword = await bcrypt.hash(req.body.password, 10);
        users.push({
        id: Date.now().toString(),
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        password: hashedpassword,
        })
        res.redirect("/login");
    }
    catch{
        res.redirect("/register");
    }
    console.log(users);
})
app.delete('/logout', (req, res) =>{
    req.logOut();
    res.redirect('/login')
})
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))
checkNotAuthenticated
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
function checkNotAuthenticated(req, res, next){
    if (req.isAuthenticated()){
      
    return res.redirect('/')  
    }
    return next()
}
app.listen(3000)