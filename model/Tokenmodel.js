const mongoose=require('mongoose')
const schema=mongoose.Schema

const tokenschema=new schema({
    userId:{
        type:schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    token:{
        type:String,
        required:true
    },
    expiredAt:{
        type:Date,
        default:Date.now,
        index:{
            expires:86400000
        }
    }
},{timestamps:true})

const Tokenmodel=mongoose.model('token',tokenschema)
module.exports=Tokenmodel