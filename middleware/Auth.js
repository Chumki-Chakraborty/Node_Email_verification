const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const nodemailer=require('nodemailer')
const hashpassword=async(password)=>{
    const saltpassword=5
    const hashpassword=await bcrypt.hash(password,saltpassword)
    return hashpassword

}
// --------------------ComparePassword-------------//
const ComparePassword=async(password,hashpassword)=>{
  return await bcrypt.compare(password,hashpassword)
}
// --------------------transport-----------------------//
const transport = (senderEmail, password) => {
    var transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth:{
        user:senderEmail,
          pass:password,
      }
    });
    return transporter
  }
// ---------------------------mailSender-------------////////////////////
  const mailSender =(req,res,trans,mailoptions)=>{
    trans.sendMail(mailoptions,(err)=>{
        if(err){
            console.log("Technical Issue",err);
        }else{
            req.flash("message1","A Verfication Email Sent To Your Mail ID.... Please Verify By Click The Link.... It Will Expire By 24 Hrs...")
            return res.redirect("/login")
        }
    })
}
// ---------------------JwtAuthCheck-----------------------//
const JwtAuthCheck=(req,res,next)=>{
  if(req.cookies && req.cookies.usertoken){
    jwt.verify(req.cookies.usertoken,process.env.SECRET_KEY,(err,data)=>{
      req.user=data
      console.log(`authuser`, req.user);
      next()
    })
   
  }else{
    console.log('can not access dashboard page!!!Login First........');
    next()
  }
  
}
module.exports={
    hashpassword,
    ComparePassword,
    transport,
    mailSender,
    JwtAuthCheck
}