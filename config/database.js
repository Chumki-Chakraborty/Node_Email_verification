const mongoose=require('mongoose')

const ConnectDb=async(req,res)=>{
    try{
        const Conn=await mongoose.connect(process.env.MONGODB_URL)
        console.log(`mongodb connected ${Conn.connection.host}`);
    }catch(error){
        console.log(`mongodb not connected ${error}`);
    }
}
module.exports=ConnectDb