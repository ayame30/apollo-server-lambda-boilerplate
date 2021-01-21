const expiryPeriod = '7D';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

export default (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    sid: {
      allowNull: false,
      unique: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      }
    },
    lastLoginAt: DataTypes.DATE,
  }, {
    freezeTableName: true,
    tableName: 'sessions',
  });

  Session.associate = (models) => {
    models.Session.belongsTo(models.User, {
      foreignKey: {
        name: 'userId'
      },
      as: 'user',
    });
  };

  Session.createToken = async function (userId) {
    const session = await this.create({ userId, lastLoginAt: new Date() });
    return session.sid;
  }

  Session.getUser = async function (token) {
    try {
      const Sequelize = sequelize.Sequelize;
      const session = await this.findOne({
        where: {
          sid: token,
          lastLoginAt: {
            $gte: Sequelize.literal(`NOW() - INTERVAL \'${expiryPeriod}\'`),
          },
        },
        include: [{ model: sequelize.models.User, as: 'user' }],
      });
      if (!session) return null;
      await session.set('lastLoginAt', new Date()).save();
      return session.user;
    } catch(err) {
      Sentry.captureException(err);
      return null;
    }
  }

  return Session;
};
