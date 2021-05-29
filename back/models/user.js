const DataTypes = require("sequelize");
const { Model } = DataTypes;

module.exports = class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        // MySQL에는 users 테이블 생성
        // id가 기본적으로 들어있다.
        email: {
          type: DataTypes.STRING(30), // STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATETIME
          allowNull: false, // 필수
          unique: true, // 고유한 값
        },
        nickname: {
          type: DataTypes.STRING(30),
          allowNull: false, // 필수
        },
        password: {
          type: DataTypes.STRING(100),
          allowNull: false, // 필수
        },
      },
      {
        modelName: "User",
        tableName: "users",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci", // 이모티콘 한글저장
        sequelize,
      }
    );
  }

  // hasOne 1:1 관계
  // hasMany 1:n 관계
  // belongsToMany n:n 관계(중간에 테이블 자동으로 생성된다.)
  // belongsTo 참조(외래키가 생긴다) foreign
  static associate(db) {
    db.User.hasMany(db.Post); // 유저는 게시글을 여러개 가지고 있을수 있다.
    db.User.hasMany(db.Comment); // 1:n 관계
    // 중간 테이블 이름 Like로 정해진다.
    // 나중에 as에 따라서 post.getLikers처럼 게시글 좋아요 누른 사람을 가져오게 됩니다.
    // through, as 는 첫글자가 대문자로 시작하면 좋다.
    db.User.belongsToMany(db.Post, { through: "Like", as: "Likers" });
    db.User.belongsToMany(db.User, {
      through: "Follow",
      as: "Followers",
      foreignKey: "FollowingId",
    });
    db.User.belongsToMany(db.User, {
      through: "Follow",
      as: "Followings",
      foreignKey: "FollowerId",
    });
  }
};
/*
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {}, {});
  User.associate = (db) => {};
  return User;
};
*/
