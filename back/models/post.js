const DataTypes = require("sequelize");
const { Model } = DataTypes;

module.exports = class Post extends Model {
  static init(sequelize) {
    return super.init(
      {
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        modelName: "Post",
        tableName: "posts",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci", // 이모티콘 한글저장
        sequelize,
      }
    );
  }

  static associate(db) {
    db.Post.belongsTo(db.User); // 참조 post.addUser, post.getUser, post.setUser
    db.Post.belongsToMany(db.Hashtag, { through: "postHashtag" }); // n:n 관계 post.addPostHasHtags
    db.Post.hasMany(db.Comment); // post.addComment, post.getComments
    db.Post.hasMany(db.Image); // post.addImages, post.getImages
    // 중간테이블 이름 Like 정해진다.
    // Liked 내가 좋아요를 누른애들
    db.Post.belongsToMany(db.User, { through: "Like", as: "Likers" }); // post.addLikers, post.removeLikers
    db.Post.belongsTo(db.Post, { as: "Retweet" }); // post.addRetweet
  }
};

/*
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define("Post", {}, {});
  Post.associate = (db) => {};
  return Post;
};
*/
