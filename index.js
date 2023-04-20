const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId, Logger } = require("mongodb");
const http = require("http");
const bcryptjs = require("bcryptjs");
const { debugPort } = require("process");
const jwt = require('jsonwebtoken');


const jwtSecret  =
  "22c5b535d5a5d722849f9fc190edaeb418573ba6b7c228aebbbc412899fe748d439d2b";

const client = new MongoClient(
  "mongodb+srv://mayuriningdalli:Shaila%4094@cluster0.xi9xhjp.mongodb.net/test"
);

const db = client.db(`test`);

const app = express();
app.use(bodyParser.json());

// // parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
const server = http.createServer(app);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header('Access-Control-Allow-Headers', 'Authorization, x-auth-token, Origin, X-Requested-With, Content-Type, Accept');
  next();
});

async function compare(userPass, hashPass) {
  const res = await bcryptjs.compareSync(userPass, hashPass);

  return res;
}
async function hashPasswrd(userPass, dbPass) {
  const res = await bcryptjs.hash(dbPass, 10);
  return compare(userPass, res);
}

//login api generates jwt
app.post("/login", async (req, res) => {
  let email = req.body.email;

  const result = await db.collection("users").findOne({ email: email });
  const passCheck = await hashPasswrd(req.body.password, result.password);

  if (result && passCheck) {
    const maxAge = 3 * 60 * 60;
          const token = jwt.sign(
            { id: result._id, email:result.email },
            jwtSecret,
            {
              expiresIn: maxAge, // 3hrs in sec
            }
          );
          res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000, // 3hrs in ms
          });
    return res.status(200).json({ Sucess: true ,data: result, token : token });
  } else {
    return res.status(401).json({Sucess: false, message: "invalid user" });
  }
});
//get api for user list
app.get("/getuserdata", async (req, res) => {
let result ={};
  var token = req.headers['x-auth-token'];
 
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' })
  else{
    jwt.verify(token,jwtSecret,async (err)=>{ 
      if(err){  
        res.status(403).send({message: err })
    }else{
      result = await db.collection("userdetails").find().toArray();
   
      return res.status(200).json({userDetails:result});
     }
    });
    
 }
  
});
//post api for adding new user
app.post("/adduser", async (req, res) => {

    var token = req.headers['x-auth-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' })
    else{
      jwt.verify(token,jwtSecret,async (err)=>{ 
        if(err){  
          res.status(403).send({message: 'user invalid' })
      }else{
        result = await db.collection("userdetails").insertOne(req.body);
     
        return res.status(200).json({userDetails:result});
        }
       });
      
    }
    
  });
//put api for update existing user
app.put("/edituser/:id", async (req, res) => {
   
     let id = new ObjectId(req.params.id);

    var token = req.headers['x-auth-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' })
    else{
      jwt.verify(token,jwtSecret,async (err)=>{ 
        if(err){  
          res.status(403).send({message: 'user invalid' })
      }else{
        result = await db.collection("userdetails").findOneAndUpdate ({ _id: id  },
        { $set: req.body },
        { returnDocument : true });
      
        return res.status(200).json({message:"user updated sucessfully."});
        }
       });
     }
  });

//delete api to delete user
app.delete("/delete/:id", async (req, res) => {
 
   let id = new ObjectId(req.params.id);

  var token = req.headers['x-auth-token'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' })
  else{
    jwt.verify(token,jwtSecret,async (err)=>{ 
      if(err){  
        res.status(403).send({message: 'user invalid' })
    }else{
      result = await db.collection("userdetails").deleteOne ({ _id: id  },
      { $set: req.body },
      { returnDocument : true });
      
      return res.status(200).json({message:"user deleted  sucessfully."});
      }
     });
   }
})
// delete multiple record
app.post("/deletemultiple", async (req, res) => {

  var token = req.headers['x-auth-token'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' })
  else{
    jwt.verify(token,jwtSecret,async (err)=>{ 
      if(err){  
        res.status(403).send({message: 'user invalid' })
    }else{
      let ids =  [];
      Object.values(req.body).map(element => {
        ids.push(new ObjectId(element));
      });
      result = await db.collection("userdetails").deleteMany({_id: { $in: ids}});

      return res.status(200).json({userDetails:result});
      }
     });
    
  }
  
});




const port = 443 || 5000;

server.listen(port, () => {
  console.log("Listening on port " + port);
});
