const express=require('express')
const { Homepage, RegisterPage, DashboardPage, LoginPage, CreateUser, Confirmation, LoginUser, LogOut, AuthCheck, Forgetpassword_page, forgetPassword, UpdatePassword_Page, UpdatePassword } = require('../controller/UserController')
const { JwtAuthCheck } = require('../middleware/Auth')

const UserRoute=express.Router()

UserRoute.get('/',Homepage)
UserRoute.get('/register',RegisterPage)
UserRoute.get('/login',LoginPage)
UserRoute.get('/dashboard',JwtAuthCheck,AuthCheck,DashboardPage)
UserRoute.get('/logout',LogOut)


UserRoute.post('/create/user',CreateUser)
UserRoute.get('/confirmation/:email/:token',Confirmation)
UserRoute.post('/create/login',LoginUser)

UserRoute.get('/forget/password',Forgetpassword_page)
UserRoute.post('/post/forget/password',forgetPassword)

UserRoute.get('/update/password/:id',UpdatePassword_Page)
UserRoute.post('/post/update/password/:id',UpdatePassword)


module.exports=UserRoute