const userModel = require('../../api/user/user.model');
const log = require('../../utils/logger.util')({ name: 'migrateUserDocuments' });
const data = require('./data.json');

module.exports = async function trophiesFix() {
  const promiseArray = [];
  data.forEach((d) => {
    const p = userModel.updateMany({ _id: d.userId }, { $set: { trophies: d.trophies } }).exec();
    promiseArray.push(p);
  });

  try {
    await Promise.all(promiseArray);
    log.info('trophies migrated');
  } catch (err) {
    log.fatal({ err }, 'failed to migrate trophies');
  }
};
