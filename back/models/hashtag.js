const DataTypes = require("sequelize");
const { Model } = DataTypes;

module.exports = class Hashtag extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
      },
      {
        modelName: "Hashtag",
        tableName: "hashtags",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci", // 이모티콘 한글저장
        sequelize,
      }
    );
  }

  static associate(db) {
    db.Hashtag.belongsToMany(db.Post, { through: "postHashtag" }); // n:n 관계
  }
};

/*
module.exports = (sequelize, DataTypes) => {
  const Hashtag = sequelize.define("Hashtag", {}, {});
  Hashtag.associate = (db) => {};
  return Hashtag;
};
*/
