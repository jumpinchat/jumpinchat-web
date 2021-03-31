const { NotFoundError } = require('../../../utils/error.util');
const { getUserByName } = require('../user.utils');

module.exports = async function getUserByNameController({ username }) {
  let user;

  try {
    user = await getUserByName(username);
  } catch (err) {
    throw err;
  }

  if (!user) {
    throw new NotFoundError('No user found');
  }

  return {
    userId: user._id,
    username,
  };
};
