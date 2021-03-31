/**
 * Created by Zaccary on 24/10/2015.
 */

const UserModel = require('./user.model');

module.exports.getUserByEmail = function getUserByEmail(email, cb) {
  const query = UserModel.findOne({ 'auth.email': email });
  if (!cb) {
    return query.exec();
  }

  return query.exec(cb);
};

module.exports.getUsersByEmail = function getUserByEmail(email, cb) {
  const query = UserModel.find({ 'auth.email': email });
  if (!cb) {
    return query.exec();
  }

  return query.exec(cb);
};

module.exports.getUserByName = function getUserByName(username, cb) {
  const query = UserModel.findOne({ username });
  if (!cb) {
    return query.exec();
  }

  return query.exec(cb);
};

module.exports.getUserById = function getUserById(id, opts, cb) {
  if (!cb) {
    cb = opts;
  }

  const query = UserModel.findOne({ _id: id })
    .lean(!!opts.lean);

  if (!cb) {
    return query.exec();
  }

  return query.exec(cb);
};

module.exports.getUserCount = function getAllUsers(cb) {
  UserModel
    .count()
    .exec(cb);
};

module.exports.getAllUsersNoPaginate = function getAllUsersNoPaginate(cb) {
  UserModel.find()
    .sort({ 'attrs.join_date': -1 })
    .lean()
    .exec(cb);
};

module.exports.getAllUsers = function getAllUsers(start, end, cb) {
  UserModel.find()
    .skip(start)
    .limit(end)
    .sort({ 'attrs.join_date': -1 })
    .lean()
    .exec(cb);
};

module.exports.removeUser = function removeUser(userId, cb) {
  const query = UserModel
    .deleteOne({ _id: userId });

  if (!cb) {
    return query.exec();
  }

  return query.exec(cb);
};

module.exports.getSiteMods = function getSiteMods() {
  return UserModel
    .find({ 'attrs.userLevel': { $gte: 20 } })
    .exec();
};
