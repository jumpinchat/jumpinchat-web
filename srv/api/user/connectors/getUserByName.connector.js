const { NotFoundError } = require('../../../utils/error.util');
const errors = require('../../../config/constants/errors');
const getUserByName = require('../controllers/user.getUserByName');

module.exports = async function getUserByNameConnector(req, res) {
  const { username } = req.params;

  try {
    const user = await getUserByName({ username });
    return res.status(200).send(user);
  } catch (err) {
    if (err.name === NotFoundError.name) {
      return res.status(404).send(err.message);
    }

    return res.status(500).send(errors.ERR_SRV.message);
  }
};
