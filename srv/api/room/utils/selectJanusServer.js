const log = require('../../../utils/logger.util')({ name: 'selectJanusServer' });
const config = require('../../../config/env');
const getAvgUsersInRoom = require('./getAvgUsersInRoom');

/*
  S = sessions on server
  r = rooms
  u = avg users per room

  Est total number of active peer connections (lower = less load)
  (S * u) - S
*/
module.exports = async function selectJanusServer() {
  const janusServers = config.janus.serverIds;

  let userAverages;
  try {
    const promises = janusServers.map(s => getAvgUsersInRoom(s));
    userAverages = await Promise.all(promises);
  } catch (err) {
    throw err;
  }

  const minLoadIndex = userAverages
    .map(({ average, total }) => (average * (total ** 2)) - total)
    .reduce((minIndex, val, i, arr) => {
      if (val < arr[minIndex]) {
        return i;
      }

      return minIndex;
    }, 0);

  return janusServers[minLoadIndex];
};
