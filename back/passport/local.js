const passport = require("passport");
const { Strategy: localStrategy } = require("passport-local");
const bcrypt = require("bcrypt");
const { User } = require("../models");

module.exports = () => {
  passport.use(
    new localStrategy(
      {
        // loginForm 에서 받은 email, password 이름동일
        usernameField: "email", // req.body.emial
        passwordField: "password", // req.body.password
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({
            where: { email },
          });
          if (!user) {
            // (서버에러, 성공, 클라리언트 에러)
            return done(null, false, {
              reason: "존재하지 않는 사용자 입니다.",
            });
          }
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          }
          return done(null, false, { reason: "비밀번호가 틀렸습니다." });
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );
};
