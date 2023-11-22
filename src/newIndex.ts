import express from "express";
import bodyParser from "body-parser";
import { initializeApp, credential } from "firebase-admin";
import "./fire-keys.json";
const key = require("./fire-keys.json");
const cookieParser = require("cookie-parser")
const cors = require("cors")

initializeApp({
  credential: credential.cert(key),
  // databaseURL: 'https://thegreenway-f50d0.firebaseio.com',
});

const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.raw());
app.use(cookieParser())
app.use(cors());

app.use(routes);

(async () => {
  try {
    app.listen(PORT);
    console.log(`server started \non port ${PORT}`);
  } catch (err) {
    console.log("server error");
  }
})();
