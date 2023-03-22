const mongoose=require("mongoose")

mongoose.connect("mongodb+srv://mayuriningdalli:Shaila%4094@cluster0.xi9xhjp.mongodb.net/test")
.then(()=>{
    console.log("mongo connected")
})
.catch(()=>{
    console.log("error")
})

const Schema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const Collection=new mongoose.model("users",Schema)

module.exports=Collection