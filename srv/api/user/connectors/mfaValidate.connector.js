const { NotFoundError, ValidationError } = require('../../../utils/error.util');
const mfaValidate = require('../controllers/mfaValidate.controller');

module.exports = async function mfaValidateConnector(req, res) {
  const {
    user,
  } = req;

  const { token } = req.body;

  if (!token) {
    return res.status(400).send('Token is required');
  }

  try {
    const response = await mfaValidate({ userId: user._id, token });
    return res.status(200).send(response);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).send(err.message);
    }

    if (err instanceof ValidationError) {
      return res.status(403).send(err.message);
    }

    return res.status(500).send();
  }
};
