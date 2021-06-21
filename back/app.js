const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const hpp = require("hpp");
const helmet = require("helmet");

const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const postsRouter = require("./routes/posts");
const hashtagRouter = require("./routes/hashtag");
const db = require("./models");
const passportConfig = require("./passport");

dotenv.config();
const app = express();
db.sequelize
  .sync()
  .then(() => {
    console.log("db 연결 성공");
  })
  .catch(console.error);

passportConfig();

// 벡엔드 디버깅 용도
// 프런트에서 벡엔드로 어떤걸 보냈는지 뜬다.
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: "http://nodejoo.site",
      credentials: true, // 쿠키를 같이 서버에 전달하고 싶으면 credentials 설정을 해줘야한다.(기본 값은 false)
    })
  );
} else {
  app.use(morgan("dev"));
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
}

// origin: * 모두다 허용
// origin: true 보낸 곳의 주소가 자동으로 들러가서 편리함
/*
app.use(
  cors({
    origin: true,
    credentials: true, // 쿠키를 같이 서버에 전달하고 싶으면 credentials 설정을 해줘야한다.(기본 값은 false)
  })
);
*/
// 업로드파일 서비스 제공
// 운영체제 마다 back/uploads 또는 back\uploads 가 될 수 있는데 이걸 join이 통일성 있게 사용할 수 있게 해준다.
// __dirnmae : 현재폴더 name (back 폴더) 의마한다.
// 의미 : __dirname+"/uploads" 이런걸 join을 사용하여 편한 방법으로 할 수 있다.
// "/" 경로는 localhost:3065/ 의마한다.
app.use("/", express.static(path.join(__dirname, "uploads")));
// 미들웨어 라는게 위에서 아래로 실행된다.
// 서버 통신 순서전에 먼저 실행되게 위에다 적어줘야한다.
// front 에서 넘어온 데이터를 req.body에 넣어주는 역확은 한다.
app.use(express.json()); // json 방식으로 넘어올때 req.body에 넣어준다.
app.use(express.urlencoded({ extended: true })); // form 에서 submit 했을때 req.body에 넣어준다.
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
      domain: process.env.NODE_ENV === "production" && ".nodejoo.site",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("hello express");
});

app.use("/post", postRouter);
app.use("/posts", postsRouter);
app.use("/user", userRouter);
app.use("/hashtag", hashtagRouter);

// 에러 처리 미들웨어 이다.
// 여기에 소스가 없으면 내부적으로 이쪽에 생성된다.
app.use((err, req, res, next) => {
  console.log("에러 미들웨어 서버 실행 중!");
});

if (process.env.NODE_ENV === "production") {
  app.listen(80, () => {
    console.log("서버 실행 중");
  });
} else {
  app.listen(3065, () => {
    console.log("로컬 서버 실행 중");
  });
}
