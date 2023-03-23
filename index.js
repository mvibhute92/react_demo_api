const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId, Logger } = require("mongodb");
const http = require("http");
const bcryptjs = require("bcryptjs");
const { debugPort } = require("process");
const jwt = require('jsonwebtoken');
const jwtSecret =
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
  res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
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

app.post("/login", async (req, res) => {
  let email = req.body.email;
  console.log(req.body);
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

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log("Listening on port " + port);
});
