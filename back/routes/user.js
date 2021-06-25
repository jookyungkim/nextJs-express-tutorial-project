const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { Op } = require("sequelize");

const { User, Post, Image, Comment } = require("../models");
const { isLoggedIn, isNotLoggedIn } = require("./mddlewares");
const db = require("../models");

const router = express.Router();

router.get("/", async (req, res, next) => {
  // GET /user
  try {
    if (req.user) {
      const fullUserWithoutPassord = await User.findOne({
        where: { id: req.user.id },
        //attributes: ["id", "nickname", "email"], // 해당되는 건만 가지고 오겠다.
        attributes: {
          exclude: ["password"], // 전체건 중에 비밀번호만 빼고 가지고 오겠다.
        },
        // join 문법
        include: [
          {
            model: Post,
            attributes: ["id"],
          },
          {
            model: User,
            as: "Followings",
            attributes: ["id"],
          },
          {
            model: User,
            as: "Followers",
            attributes: ["id"],
          },
        ],
      });
      res.status(200).json(fullUserWithoutPassord);
    } else {
      res.status(200).json(null);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/login", (req, res, next) => {
  // POST /user/login
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      // 서버 에러일경우
      console.error(err);
      return next(err);
    }
    console.log("routes-user-login-user", user);
    console.log("routes-user-login-info", info);
    if (info) {
      return res.status(401).send(info.reason); // 클라이언트 에러일경우 send로 메시지 전달
    }
    return req.login(user, async (loginErr) => {
      if (loginErr) {
        // passport 에러일 경우(에러가 난적은 못봤다..)
        console.error(loginErr);
        return next(loginErr);
      }

      const fullUserWithoutPassord = await User.findOne({
        where: { id: user.id },
        //attributes: ["id", "nickname", "email"], // 해당되는 건만 가지고 오겠다.
        attributes: {
          exclude: ["password"], // 전체건 중에 비밀번호만 빼고 가지고 오겠다.
        },
        // join 문법
        include: [
          {
            model: Post,
            attributes: ["id"],
          },
          {
            model: User,
            as: "Followings",
            attributes: ["id"],
          },
          {
            model: User,
            as: "Followers",
            attributes: ["id"],
          },
        ],
      });

      // res.setHeader('Cookie', 'cxlhy')
      return res.status(200).json(fullUserWithoutPassord); // 정상응답
    });
  })(req, res, next);
});

router.post("/", isNotLoggedIn, async (req, res, next) => {
  // POST /user
  try {
    // 비동기인지 아닌지는 공식 문서를 찾아봐야한다.
    const exUser = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (exUser) {
      return res.status(403).send("이미 사용중인 아이디입니다.");
    }
    // bcrypt 는 비밀번호 암호화하는데 사용한다.
    // 비밀번호를 hash로 바꿔준다. 뒤에 파라메터로 들어가는게 암호화 레벨인데 숫자가 클수록 암호가 강해진다.
    // 다만 숫자가 커질수록 서버에 부담도 커진다.. 그래서 보통 10~13을 주로 사용한다.
    // 보통 1초정도 걸리는 숫자로 맞쳐준다.
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    // POST /user
    // await 을 사용하려면 async 함수로 만들어 줘야한다.
    // await을 붙여져야 순서에 맞쳐 실행된다.(res.json보다 먼저 실행하기 위해 사용)
    await User.create({
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword,
    });
    //res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(201).send("ok"); // 200 성공 , 201 잘 생성됨
  } catch (error) {
    console.error(error);
    // next 브라우저로 무슨 에러가 났는지 처리해서 보여준다.
    next(error); // status 500
  }
});

router.post("/logout", (req, res, next) => {
  // POST /user/logout
  req.logout();
  req.session.destroy();
  res.send("ok");
});

router.patch("/nickname", isLoggedIn, async (req, res, next) => {
  // PATCH user/nickname
  try {
    await User.update(
      {
        nickname: req.body.nickname,
      },
      {
        where: { id: req.user.id },
      }
    );
    res.status(200).json({ nickname: req.body.nickname });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch("/:userId/follow", isLoggedIn, async (req, res, next) => {
  // PATCT /user/1/follow
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send("없는 사람을 팔로우하려고 하시네요?");
    }

    await user.addFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/followers", async (req, res, next) => {
  // GET /user/followers
  console.log("followers-Cookies: ", req.headers.cookie);
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      res.status(403).send("없는 사람을 입니다.");
    }

    const followers = await user.getFollowers({
      limit: parseInt(req.query.limit, 0),
    });
    res.status(200).json(followers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/followings", async (req, res, next) => {
  // GET /user/followings
  console.log("followings-Cookies: ", req.headers.cookie);
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      res.status(403).send("없는 사람을 입니다.");
    }

    const followings = await user.getFollowings({
      limit: parseInt(req.query.limit, 10),
    });
    res.status(200).json(followings);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/:userId/posts", async (req, res, next) => {
  // GET /user/1/posts
  try {
    const where = { UserId: req.params.userId };
    if (parseInt(req.query.lastId, 10)) {
      // 초기 로딩이 아닐 때
      // 보다 작은 거 10개 불러오기
      // 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
      // Op.lt 이것보다 작은 의미
      where.id = { [Op.lt]: parseInt(req.query.lastId, 10) };
    }
    const posts = await Post.findAll({
      where,
      limit: 10,
      order: [
        ["createdAt", "DESC"],
        [Comment, "createdAt", "DESC"],
      ],
      include: [
        {
          model: User,
          attributes: ["id", "nickname"],
        },
        {
          model: Image,
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
            },
          ],
        },
        {
          model: User, // 좋아요 누른사람
          as: "Likers",
          attributes: ["id"],
        },
        {
          model: Post,
          as: "Retweet",
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
            },
            {
              model: Image,
            },
          ],
        },
      ],
    });

    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete("/follower/:userId", isLoggedIn, async (req, res, next) => {
  // DELETE /user/follower/1
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send("없는 사람을 차단할고 하시네요?");
    }

    await user.removeFollowings(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/:userId/follow", isLoggedIn, async (req, res, next) => {
  // DELETE /user/1/follow
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send("없는 사람을 언팔로우하려고 하시네요?");
    }

    await user.removeFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/:userId", async (req, res, next) => {
  // GET /user/2
  try {
    const fullUserWithoutPassord = await User.findOne({
      where: { id: req.params.userId },
      //attributes: ["id", "nickname", "email"], // 해당되는 건만 가지고 오겠다.
      attributes: {
        exclude: ["password"], // 전체건 중에 비밀번호만 빼고 가지고 오겠다.
      },
      // join 문법
      include: [
        {
          model: Post,
          attributes: ["id"],
        },
        {
          model: User,
          as: "Followings",
          attributes: ["id"],
        },
        {
          model: User,
          as: "Followers",
          attributes: ["id"],
        },
      ],
    });

    if (fullUserWithoutPassord) {
      const data = fullUserWithoutPassord.toJSON();
      data.Posts = data.Posts.length;
      data.Followers = data.Followers.length;
      data.Followings = data.Followings.length;
      res.status(200).json(data);
    } else {
      res.status(404).json("존재하지 않는 사용자입니다.");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
