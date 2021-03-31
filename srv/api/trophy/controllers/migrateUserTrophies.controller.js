const log = require('../../../utils/logger.util')({ name: 'trophy utils' });
const Queue = require('../../../utils/queue.util');
const userModel = require('../../user/user.model');
const trophyModel = require('../trophy.model');
const trophyUtils = require('../trophy.utils');

function applyStatusTrophies(user, trophies) {
  let applicableTrophies = [];

  if (user.attrs.userLevel === 30) {
    applicableTrophies = [
      ...applicableTrophies,
      trophies.find(t => t.name === 'TROPHY_SITE_ADMIN'),
    ];
  }

  if (user.auth.email_is_verified) {
    applicableTrophies = [
      ...applicableTrophies,
      trophies.find(t => t.name === 'TROPHY_EMAIL_VERIFIED'),
    ];
  }

  applicableTrophies
    .map(t => ({ trophyId: t._id }))
    .filter(t => !user.trophies.map(userTrophy => String(userTrophy.trophyId)).includes(String(t.trophyId)))
    .forEach(t => user.trophies.push(t));

  return user;
}

function handleMigration(user, trophies, cb) {
  return trophyUtils.findApplicableTrophies(user._id, (err) => {
    if (err) {
      log.error({ err, userId: user._id }, 'failed to apply trophies to user');
      return cb(err);
    }

    return applyStatusTrophies(user, trophies).save(cb);
  });
}

module.exports = async function migrateUserTrophies(req, res) {
  log.debug('migrateUserTrophies');
  try {
    const users = await userModel.find().exec();
    const trophies = await trophyModel.find().exec();

    const queue = new Queue(handleMigration, 100);
    queue.on('done', () => {
      log.info({ users: users.length }, 'trophies migration done');
    });

    const callback = (err) => {
      if (err) {
        log.fatal({ err }, 'error applying migration');
        return;
      }

      log.debug('applied trophies');
    };

    users
      .forEach((user) => {
        const args = [user, trophies, callback];
        queue.addToQueue(args);
      });

    return res.status(200).send();
  } catch (err) {
    log.fatal({ err });
    return res.status(500).send();
  }
};
