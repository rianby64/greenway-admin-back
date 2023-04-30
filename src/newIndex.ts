import express from 'express';
import bodyParser from 'body-parser';
import { initializeApp, credential } from 'firebase-admin';
import './fire-keys.json';
const routes = require("./routes")

const app = express();
const key = require('./fire-keys.json');
const PORT = process.env.PORT || 3000;

app.use(routes);
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.raw());

initializeApp({
  credential: credential.cert(key),
  // databaseURL: 'https://thegreenway-f50d0.firebaseio.com',
});

(async () => {
  try {
    app.listen(PORT);
    console.log("server started");
  } catch (err) {
    console.log("server error")
  }
}
)();
