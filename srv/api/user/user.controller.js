/**
 * Created by vivaldi on 08/11/2014.
 */

const userCreateSession = require('./controllers/user.createSession');
const userCreate = require('./controllers/user.create');
const userLogin = require('./controllers/user.login');
const userCheckUsername = require('./controllers/user.checkusername');
const userUpdateSession = require('./controllers/user.updateSession');


exports.logout = function logout(req, res) {
  // clear cookies
  if (req.signedCookies['jic.ident']) {
    res.clearCookie('jic.ident');
    res.end();
  }
};

module.exports.createSession = userCreateSession;
module.exports.createUser = userCreate;
module.exports.login = userLogin;
module.exports.checkUsername = userCheckUsername;
module.exports.updateSession = userUpdateSession;
