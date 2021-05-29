const passport = require("passport");
const local = require("./local");
const { User } = require("../models");

module.exports = () => {
  // 처음 로그인 user.id 넣어주기
  passport.serializeUser((user, done) => {
    // routes/user.js req.login 함수가 실행될때 동시에 싱행된다.
    // 쿠키랑 묶어줄 사용자 로그인 ID
    done(null, user.id);
  });

  // 로그인 완료되고나서 매번 실행
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({ where: { id } });
      done(null, user); // req.user
    } catch (error) {
      console.error(error);
      done(error);
    }
  });

  local();
};
