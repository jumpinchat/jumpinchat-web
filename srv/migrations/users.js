const userModel = require('../api/user/user.model');
const log = require('../utils/logger.util')({ name: 'migrateUserDocuments' });

module.exports = function migrateUsers() {
  return userModel.find({}).exec((err, users) => {
    if (err) {
      log.fatal({ err }, 'error fetching users');
      return;
    }

    users.forEach(u => u.save((err) => {
      if (err) {
        log.fatal({ err }, 'error saving user');
        return;
      }

      log.debug('updated user doc');
    }));
  });
};
