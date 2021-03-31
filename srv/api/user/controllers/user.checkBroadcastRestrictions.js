const log = require('../../../utils/logger.util')({ name: 'user.checkBroadcastRestrictions' });
const { getBanlistItem } = require('../../siteban/siteban.utils');
const { getRemoteIpFromReq } = require('../../../utils/utils');
const errors = require('../../../config/constants/errors');
const videoQuality = require('../../../config/constants/videoQuality');
const { getRoomByName } = require('../../room/room.utils');
const { getUserHasRolePermissions } = require('../../role/role.utils');
const { getUserById } = require('../user.utils');
const { PermissionError } = require('../../../utils/error.util');

module.exports = async function checkBroadcastRestrictions(req, res) {
  const { sessionID } = req;
  const { roomName } = req.params;
  const ip = getRemoteIpFromReq(req);
  const identId = req.signedCookies['jic.ident'];

  if (roomName) {
    log.debug({ roomName }, 'checking for room restrictions');
    try {
      const room = await getRoomByName(roomName);

      if (!room) {
        log.error({ roomName }, 'room not found');
        return res.status(404).send(errors.ERR_NO_ROOM);
      }

      if (room.attrs.ageRestricted) {
        if (!identId) {
          return res.status(403).send('ERR_AGE_RESTRICTED');
        }

        const user = await getUserById(identId, { lean: true });

        if (!user.attrs.ageVerified) {
          return res.status(403).send('ERR_AGE_RESTRICTED');
        }
      }
    } catch (err) {
      log.fatal({ err, roomName }, 'error getting room');
      return res.status(500).send(errors.ERR_SRV);
    }

    try {
      const ident = {
        userId: identId,
        ip,
        sessionId: sessionID,
      };

      await getUserHasRolePermissions(roomName, ident, 'broadcast');
    } catch (err) {
      if (err instanceof PermissionError) {
        log.error({ err }, 'no permission to broadcast');
        return res.status(403).send(err);
      }

      log.fatal({ err }, 'failed checking role permissions');

      return res.status(500).send(errors.ERR_SRV);
    }
  }

  try {
    log.debug('checking for site-wide restrictions');
    const banlistItem = await getBanlistItem({ sessionId: sessionID, ip, userId: identId });
    if (!banlistItem) {
      return res.status(200).send({
        videoOptions: [
          ...Object.values(videoQuality),
        ],
      });
    }

    const banExpired = new Date(banlistItem.expiresAt).getTime() < Date.now();

    if (banlistItem && banlistItem.restrictions.broadcast && !banExpired) {
      log.info({ sessionID, userId: identId }, 'user broadcast banned');
      return res.status(403).send('ERR_BROADCAST_BAN');
    }

    return res.status(200).send();
  } catch (err) {
    log.fatal({ err }, 'failed to fetch banlist item');
    return res.status(500).send(errors.ERR_SRV);
  }
};
