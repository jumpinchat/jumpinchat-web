const config = require('../../config/env');
const { statuses } = require('./ageVerification.const');
const AgeVerificationModel = require('./ageVerification.model');

module.exports.findById = function findById(id) {
  return AgeVerificationModel
    .findOne({
      _id: id,
    })
    .exec();
};

module.exports.getRequests = function getRequests() {
  return AgeVerificationModel
    .find()
    .exec();
};

module.exports.getRequestsByUser = function getRequestsByUser(userId) {
  return AgeVerificationModel
    .find({
      status: { $eq: statuses.PENDING },
      user: userId,
      expiresAt: { $gt: new Date() },
    })
    .sort({ updatedAt: -1 })
    .exec();
};

module.exports.findRecentDeniedRequests = function findRecentDeniedRequests(userId) {
  return AgeVerificationModel
    .find({
      status: statuses.DENIED,
      user: userId,
      updatedAt: { $gt: Date.now() - config.ageVerification.deniedTimeout },
    })
    .sort({ updatedAt: -1 })
    .exec();
};
