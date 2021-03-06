const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const hpp = require("hpp");
const helmet = require("helmet");
const fs = require("fs");
const cookieParser = require("cookie-parser");

const app = express();

// MySQL
const db = require("./models");
db.sequelize
  .sync()
  .then(() => {
    console.log("DB 연결 성공");
  })
  .catch((error) => {
    console.error(error);
  });

// public 폴더 생성
try {
  fs.accessSync("public");
} catch (error) {
  console.log("public 폴더가 없습니다. 새로 생성합니다.");
  fs.mkdirSync("public");
}

// static
app.use("/", express.static(path.join(__dirname, "public")));

const dotenv = require("dotenv");
dotenv.config();

const passportconfig = require("./passport/kakao");
passportconfig();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
  app.use(hpp());
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: ["*"],
      // credentials: true,
    })
  );
} else {
  app.use(morgan("dev"));
  app.use(
    cors({
      origin: "*",
      // credentials: true,
    })
  );
}

// routes
const router = require("./routes/router");
app.use("/api", router);

module.exports = app;
