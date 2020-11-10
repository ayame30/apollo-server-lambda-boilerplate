export default (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    content: DataTypes.TEXT,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      }
    },
  }, {
    paranoid: true, // Soft delete
    tableName: 'posts',
  });

  return Post;
};
