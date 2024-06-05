const express=require('express')
const app=express()
const bodyParser = require('body-parser')
const flash = require('connect-flash');
const session = require('express-session')
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

const dotenv=require('dotenv')
dotenv.config()
const mongodb_connection=require('./config/database')
mongodb_connection()

app.set('view engine',"ejs")
app.set('views',"views")

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000}
  }))
app.use(flash());
// UserRoute
const UserRoute=require('./route/UserRoute')
app.use(UserRoute)

const port=5454
app.listen(port,()=>{
    console.log(`server is running http://localhost:${port}`);
})