
const mongoose =require("mongoose");

const  connection = async()=>{
try{
   
 const conn= await mongoose.connect(process.env.MONGO_URI,{

 //connection.getCollection("user").renameCollection("googleUser")

    useNewUrlParser: true,
    useUnifiedTopology: true,
 });
 console.log("Database connected")
}

catch(err)
{
    console.log(err)
}

}
module.exports = connection