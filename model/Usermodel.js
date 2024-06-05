const mongoose=require('mongoose')

const schema=mongoose.Schema

const UserSchema=new schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    Confrim_password:{
        type:String,
        required:true
    },
    Mobile:{
        type:Number,
        required:true
    },
 isVerified:{
        type:Boolean,
        defaut:false,
    },
    status:{
        type:String,
        default:1
    }
    
},{timestamps:true})
const UserModel=mongoose.model('User',UserSchema)
module.exports=UserModel