import bcrypt from 'bcryptjs';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    type: {
      type: DataTypes.ENUM('CLIENT', 'ADMIN'),
      defaultValue: 'CLIENT',
      allowNull: false,
      validate: { notEmpty: true },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true, notEmpty: true },
    },
    tel: {
      type: DataTypes.STRING,
      validate: {
        isValidPhoneNo: function(value) {
            if (!value) return value;
            var regexp = /^[0-9]+$/;
            var values = (Array.isArray(value)) ? value : [value];

            values.forEach(function(val) {
                if (!regexp.test(val)) {
                    throw new Error("Number only is allowed.");
                }
            });
            return value;
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    resetToken: DataTypes.STRING,
    resetExpiredAt: DataTypes.DATE,
  }, {
    freezeTableName: true,
    hooks: {
      beforeCreate: (user) => {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(8));
      },
      beforeUpdate: (user) => {
        if (user.changed('password')) {
          user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(8));
        }
      },
    },
    tableName: 'users',
  });

  User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  User.prototype.createResetToken = async function() {
    const token = Math.random().toString(36).substring(7);
    const resetExpiredAt = new Date();
    resetExpiredAt.setDate(resetExpiredAt.getDate() + 1);
    await this
      .set('resetToken', token)
      .set('resetExpiredAt', resetExpiredAt)
      .save();
    return token;
  }

  User.prototype.resetPassword = async function(password) {
    await this
      .set('resetToken', null)
      .set('resetExpiredAt', null)
      .set('password', password)
      .save();
    return this;
  }

  User.prototype.isPermitToReadUser = async function (userId) {
    switch (this.type) {
      case 'ADMIN': return true;
      case 'CLIENT':
      case 'DEFAULT':
        if (!userId || userId != this.id) return false; // input ID can be INT/STRING
    }
    return true;
  }
  User.prototype.isPermitToWriteUser = async function (userId) {
    switch (this.type) {
      case 'ADMIN': return true;
      case 'CLIENT':
      case 'DEFAULT':
        if (!userId || userId != this.id) return false; // input ID can be INT/STRING
    }
    return true;
  }
  User.prototype.isAdmin = function () { return this.type === 'ADMIN'; }
  User.prototype.isClient = function () { return this.type === 'CLIENT'; }

  User.login = async ({ email, password, type }) => {
    const user = await User.findOne({
      where: {
        email
      },
    });
    if (user && user.validPassword(password)) return user;
    return null;
  }

  return User;
};
