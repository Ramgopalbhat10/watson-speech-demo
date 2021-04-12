const express = require("express");
const path = require("path");
const app = express();
const { IamTokenManager } = require("ibm-watson/auth");
const cors = require("cors");
require("dotenv").config();

app.use(express.static(path.join(__dirname, "dist")));
app.use(cors());

const sttAuthenticator = new IamTokenManager({
  apikey: process.env.STT_IAM_KEY,
});
const ttsAuthenticator = new IamTokenManager({
  apikey: process.env.TTS_IAM_KEY,
});

app.use("/api/stt/token", function (req, res) {
  console.log("Req came for stt");
  return sttAuthenticator
    .requestToken()
    .then(({ result }) => {
      res.json({
        accessToken: result.access_token,
        url: process.env.STT_API_URL,
      });
    })
    .catch(console.error);
});
app.use("/api/tts/token", function (req, res) {
  console.log("Req came for tts");
  return ttsAuthenticator
    .requestToken()
    .then(({ result }) => {
      res.json({
        accessToken: result.access_token,
        url: process.env.TTS_API_URL,
      });
    })
    .catch(console.error);
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "dist/voice-recognition/index.html"));
});

const port = 8088;
app.listen(port, function () {
  console.log(
    `IBM Watson Speech & token server live at http://localhost:${port}/`
  );
});
