const express = require('express')
const json = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const serverRoutes = require("./api/ServerRoutes");


const port = 3000;
const app = express();


app.use('/', (req, res, next) => {
  res.header("Access-Control-Allow-origin", "*")
  next();
})


app.use(cors(
  {
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    preflightContinue: true,
    credentials: true
  }
));

app.use(json());
app.use(express.urlencoded({ extended: false }))

mongoose.set("strictQuery", false);

main().catch((er) => { console.log(er); })

async function main() {
  await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@dbcluster.nlm3zmb.mongodb.net/${process.env.COLLECTION_NAME}?retryWrites=true&w=majority`)
    .then(() => {
      console.log("database connected");
    })
    .catch((e) => {
      console.log("Error detected at :", e);
    })
}




app.use('/', serverRoutes);



app.listen(port, () => {
  console.log("server Running at port", port);
})

module.exports = app;