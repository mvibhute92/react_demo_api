const express=require("express")
const Collection=require("./mongo")

const app=express()
const path=require("path")
const jwt=require("jsonwebtoken")
const cookieParser=require("cookie-parser")
const bcryptjs=require("bcryptjs")

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))


const tempelatePath=path.join(__dirname,"../tempelates")
const publicPath=path.join(__dirname,"../public")

app.set('view engine','hbs')
app.set("views",tempelatePath)
app.use(express.static(publicPath))



async function hashPass(password){

    const res=await bcryptjs.hash(password,10)
    return res

}
async function compare(userPass,hashPass){

    const res=await bcryptjs.compare(userPass,hashPass)
    return res

}



app.get("/",(req,res)=>{

    if(req.cookies.jwt){
        const verify=jwt.verify(req.cookies.jwt,"helloandwelcometotechywebdevtutorialonauthhelloandwelcometotechywebdevtutorialonauth")
    res.render("home",{name:verify.name})
    }

    else{
        res.render("login")
    }

})
app.get("/signup",(req,res)=>{
    res.render("signup")
})


app.post("/signup",async(req,res)=>{
    try{
        const check=await Collection.findOne({name:req.body.name})

        if(check){
            res.send("user already exist")
        }

        else{
            const token=jwt.sign({name:req.body.name},"helloandwelcometotechywebdevtutorialonauthhelloandwelcometotechywebdevtutorialonauth")

            res.cookie("jwt",token,{
                maxAge:600000,
                httpOnly:true
            })


            const data={
                name:req.body.name,
                password:await hashPass(req.body.password),
                token:token
            }

            await Collection.insertMany([data])

            res.render("home",{name:req.body.name})

        }

    }
    catch{

        res.send("wrong details")

    }
})


app.post("/login",async(req,res)=>{
    try{
      console.log(req.body.email, req.body.password);
        const check=await Collection.findOne({email:req.body.email})
        const passCheck=await compare(req.body.password,check.password)
        console.log(check, passCheck);
        if(check && passCheck){
          
            res.cookie("jwt",check.token,{
                maxAge:600000,
                httpOnly:true
            })

            res.render("home",{email:req.body.email})
        }
        
        else{
            
            res.send("wrong details")

        }

    }
    catch{

        res.send("wrong details in catch")

    }
})







app.listen(5000,()=>{
    console.log("port connected")
})

// async function main(){
//     /**
//      * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
//      * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
//      */
//     const uri = "mongodb+srv://mayuriningdalli:Shaila%4094@cluster0.xi9xhjp.mongodb.net/test";
 

//     const client = new MongoClient(uri);
 
//     try {
//         // Connect to the MongoDB cluster
//         await client.connect();
 
//         // Make the appropriate DB calls
//         await  listDatabases(client);
 
//     } catch (e) {
//         console.error(e);
//     } finally {
//         await client.close();
//     }
// }

// main().catch(console.error);

// async function listDatabases(client){
//     databasesList = await client.db().admin().listDatabases();
 
//     console.log("Databases:");
//     databasesList.databases.forEach(db => console.log(` - ${db.name}`));
// };
