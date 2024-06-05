const TokenModel = require('../model/Tokenmodel')
const UserModel = require('../model/Usermodel')
const flash = require('connect-flash')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { hashpassword, transport, mailSender, ComparePassword } = require('../middleware/Auth')
const { error } = require('console')

const Homepage = (req, res) => {
    res.render('homepage', {
        title: 'home page'
    })
}
// -------------RegisterPage----------//
const RegisterPage = (req, res) => {
    res.render('registerpage', {
        title: "register page",
        message1: req.flash('message1')
    })
}
// -------------LoginPage----------//

const LoginPage = (req, res) => {
    res.render('loginpage', {
        title: "loginpage",
        message1: req.flash('message1'),
        message2: req.flash('message2')

    })
}

// -------------DashboardPage----------//
const DashboardPage = async(req, res) => {
    try{
        
        res.render('dashboardpage', {
            title: "dashboard page",
            Data:req.user
        })
    }catch(error){
        console.log(error);
    }
    
    
}
// ---------------------------CreateUser-----------------------//
const CreateUser = async (req, res) => {
    try {
        const { name, email, password, Confrim_password, Mobile } = req.body
        if (!(name && email && password && Confrim_password && Mobile)) {
            console.log(`all fields are required`);
            req.flash('message1', "all fields are required")
            return res.redirect('/register')
        }
        if (password !== Confrim_password) {
            console.log('password and confirm password is not same');
            req.flash('message1', "password and confirm password is not same")
            return res.redirect('/register')
        }
        // ExistingUser
        const ExistingUser = await UserModel.findOne({ email })
        if (ExistingUser) {
            console.log(`email is already registered`);
            req.flash('message1', "email is already registered")
            return res.redirect('/register')
        }
        // HashPassword
        const HashPassword = await hashpassword(password, Confrim_password)
        const newuser = new UserModel({
            name,
            email,
            password: HashPassword,
            Confrim_password: HashPassword,
            Mobile
        })
        const user = await newuser.save()
        console.log(user);
        if (user) {
            const tokenmodel = new TokenModel({
                userId: user._id,
                token: crypto.randomBytes(16).toString('hex')
            })
            const token = await tokenmodel.save()
            console.log(token);
            if (token) {
                const senderEmail = "chumki8961@gmail.com";
                const password = "jlbe gpep mhdm vljs";
                var transporter = transport(senderEmail, password)
                var mailoptions = {
                    from: 'no-reply@raju.com',
                    to: user.email,
                    subject: 'Account Verification',
                    text: 'Hello ' + req.body.name + ',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + user.email + '\/' + token.token + '\n\nThank You!\n'
                }
                mailSender(req, res, transporter, mailoptions)
            } else {
                console.log(`error to create token`, error);
            }
        }
    } catch (error) {
        console.log(`User registration failed`);
        req.flash('message1', "User registration failed")
        return res.redirect('/register')
    }
}
// -------------------------------Confirmation-----------------------------//
const Confirmation = async (req, res) => {
    try {
        const Token = await TokenModel.findOne({ token: req.params.token })
        if (!Token) {
            console.log(`verification link may be expired or token is not matched`);
            req.flash('message2', 'verification link may be expired or token is not matched')
            return res.redirect("/login")
        } 
            const user = await UserModel.findOne({ _id: Token.userId, email: req.params.email })
            if (!user) {
                console.log(`User not found because Email is not matched`);
                req.flash('message2', 'User not found because Email is not matched')
                return res.redirect("/login")
            }
            else if (user.isVerified) {
                console.log(`you are clicking this link more than two times!!!User is already verified`);
                req.flash('message2', 'you are clicking this link more than two times!!!User is already verified')
                return res.redirect("/login")
            }
            else {

                user.isVerified = true
                const result = user.save()
                if (result) {
                    console.log(`User verification successfully done`);
                    req.flash('message1', 'User verification successfully done')
                    return res.redirect("/login")
                }

            }
        
    } catch (error) {
        console.log(`error while finding user!!`, error);
    }
}
// ------------------------LoginUser-----------------------//
const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!(email && password)) {
            console.log(`all fields are required`);
            req.flash('message2', 'all fields are required')
            return res.redirect("/login")
        }
        // -------Email check-----//
        const user = await UserModel.findOne({ email })
        if (!user) {
            console.log(`email is not registered!!`);
            req.flash('message2', 'Email is not registered!!')
            return res.redirect("/login")
        }
        // ----------------------MatchPassword-----------------//
        if (user.IsVerified = true) {
            const MatchPassword = await ComparePassword(password, user.password)
            if (!MatchPassword) {
                console.log(`Incorrect password`);
                req.flash('message2', 'Incorrect password')
                return res.redirect("/login")
            }
            const token = await jwt.sign({
                _id: user._id,
                name: user.name,
                email: user.email,
                password: user.password,
                Confrim_password: user.Confrim_password,
                Mobile: user.Mobile
            }, process.env.SECRET_KEY, { expiresIn: '10 hr' })
            if (token) {
                console.log(`Login sucessfull`);
                res.cookie('usertoken', token)
                return res.redirect("/dashboard",)
            } else {
                console.log(`error to login`);
                req.flash('message2', 'error to login')
                return res.redirect("/login")
            }
        }
    } catch (error) {
        console.log(error);
    }
}
// -------------------------------LogOut----------------------//
const LogOut=(req,res)=>{
    res.clearCookie('usertoken')
    return res.redirect('/login')
}
// --------------------AuthCheck----------------//
const AuthCheck=(req,res,next)=>{
    if(req.user){
        next()
    }else{
        return res.redirect("/login")   
    }
}
// --------------------------------Forgetpassword_page-------------------------------//
const Forgetpassword_page=(req,res)=>{
    res.render('forgetpassword',{
        title:'forget password page',
        message2:req.flash('message2')
    })
}
// -----------------------forgetPassword---------------------------//
const forgetPassword=async(req,res)=>{
    try{
        const{email,Mobile,newpassword}=req.body
        if(!(email&&Mobile&&newpassword)){
            console.log(`all fields are required`);
            req.flash('message2','all fields are required')
            return res.redirect('/forget/password')
        }
        const user=await UserModel.findOne({email,Mobile})
        if(!user){
            console.log(`Incorrect email and password`);
            req.flash('message2','Incorrect email and password')
            return res.redirect('/forget/password')
        }
        const hashed=await hashpassword(newpassword)
        const ChangePassword=await UserModel.findByIdAndUpdate(user._id,{
            password:hashed
        })
        if(ChangePassword){
            console.log(`password has been updated `);
            return res.redirect('/dashboard')
        }
    }catch(error){
        return res.redirect('/forget/password')
    }
}
// -------------------------UpdatePaswword_Page--------------------//
const UpdatePassword_Page=async(req,res)=>{
   try{
    const id=req.params.id
    const updatepassword=await UserModel.findById(id)
    res.render('updatepassword',{
        title:"update password",
        data:updatepassword
    })
   }catch(error){
    console.log(error);
   }
}
// ----------------------------------UpdatePassword----------------------//
const UpdatePassword=async(req,res)=>{
    try{
        const userid=req.params.id
        const{updatepassword,newemail}=req.body
        // const data=await UserModel.findById(id)
        const data=await UserModel.findOne({_id:userid})
        if(data){
            const hash=await hashpassword(updatepassword)
            const Changepassword=await UserModel.findByIdAndUpdate({_id:userid},{
                $set:{
                    password:hash,
                    email:newemail
                }
            })
            if(Changepassword){
                console.log(`password updated `);
                return res.redirect('/login')
            }
        }
        

    }catch(error){
        return res.redirect('/update/password')
    }
}
module.exports = {
    Homepage,
    RegisterPage,
    LoginPage,
    DashboardPage,
    CreateUser,
    Confirmation,
    LoginUser,
    LogOut,
    AuthCheck,
    Forgetpassword_page,
    forgetPassword,
    UpdatePassword_Page,
    UpdatePassword

}