/**
 * Created by Zaccary on 25/07/2016.
 */

const log = require('../../../utils/logger.util')({ name: 'getUserList.controller' });
const config = require('../../../config/env');
const UserUtils = require('../../user/user.utils');

module.exports = function getUserList(req, res) {
  const { page } = req.query;
  UserUtils.getUserCount((err, count) => {
    if (err) {
      log.fatal({ err }, 'error getting user list');
      return res.status(500).send(err);
    }

    const countPerPage = config.admin.userList.itemsPerPage;
    const start = ((page - 1) * countPerPage);

    UserUtils.getAllUsers(start, countPerPage, (err, users) => {
      if (err) {
        log.fatal({ err }, 'error getting user list');
        return res.status(500).send(err);
      }

      const sanitizedUsers = users.map(user => Object.assign({}, user, {
        auth: Object.assign({}, user.auth, { passhash: '' }),
      }));

      res.status(200).send({
        count,
        users: sanitizedUsers,
      });
    });
  });
};
