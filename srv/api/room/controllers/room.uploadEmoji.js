const Busboy = require('busboy');
const uuid = require('uuid');
const log = require('../../../utils/logger.util')({ name: 'uploadEmoji' });
const { getRoomByName } = require('../room.utils');
const { getUserHasRolePermissions } = require('../../role/role.utils');
const roomEmojiModel = require('../roomEmoji.model');
const {
  convertImages,
  mergeBuffers,
  s3Upload,
  isValidImage,
  getExtFromMime,
} = require('../../../utils/utils');

const config = require('../../../config/env');
const errors = require('../../../config/constants/errors');

function createEmojiItem({
  userId,
  imageUri,
  alias,
  roomId,
}) {
  return roomEmojiModel.create({
    image: imageUri,
    addedBy: userId,
    alias,
    room: roomId,
  });
}

module.exports = function uploadEmoji(req, res) {
  let busboy;
  let hasErr = false;
  const body = {};

  const { roomName } = req.params;

  try {
    busboy = new Busboy({
      headers: req.headers,
      limits: {
        fileSize: config.uploads.userIcon.size,
        files: 1,
      },
    });
  } catch (e) {
    log.error('error happened');
    return res.status(415).send();
  }

  busboy.on('field', (fieldName, val) => {
    log.debug({ fieldName, val });
    body[fieldName] = val;
  });

  busboy.on('file', (fieldname, file, fileName, encoding, mimeType) => {
    log.debug('Processing file');

    if (!isValidImage(mimeType)) {
      log.error({ mimeType }, 'invalid file type');
      return res.status(400).send(errors.ERR_FILE_TYPE);
    }

    const dataArr = [];

    file.on('data', (data) => {
      dataArr.push({ data, length: data.byteLength });
    });

    file.on('limit', () => {
      hasErr = true;
      log.error('File has hit limit');
      return res.status(400).send(errors.ERR_FILE_LIMIT);
    });

    file.on('end', () => {
      log.debug('file end');

      if (hasErr) {
        return;
      }

      const dimensions = {
        width: config.uploads.userIcon.width,
        height: config.uploads.userIcon.height,
      };

      convertImages(mergeBuffers(dataArr), dimensions, async (err, convertedImage) => {
        if (err) {
          log.fatal({ err }, 'failed to convert images');
          return res.status(500).send(err);
        }

        const { userId, alias } = body;

        try {
          const emoji = await roomEmojiModel.findOne({ alias }).exec();
          if (emoji) {
            return res.status(403).send(errors.ERR_EXISTS);
          }
        } catch (err) {
          log.fatal({ err }, 'failed to find existing emoji');
          return res.status(500).send(errors.ERR_SRV);
        }

        let hasPermission;
        try {
          hasPermission = await getUserHasRolePermissions(roomName, { userId }, 'uploadEmoji');
        } catch (err) {
          return res.status(500).send(errors.ERR_SRV);
        }

        if (!hasPermission) {
          log.warn({ userId, roomName }, 'non-mod attempted to upload emoji');
          return res.status(401).send(errors.ERR_NO_PERMISSION);
        }

        try {
          const room = await getRoomByName(roomName);
          const newFileName = uuid.v4();
          const filePath = `room-emoji/${newFileName}.${getExtFromMime(mimeType)}`;

          log.debug('uploading image to s3');

          s3Upload(convertedImage, filePath, async (err, data) => {
            if (err) {
              log.fatal({ err }, 'upload to s3 failed');
              return res.status(500).send();
            }

            log.info(`upload done: ${filePath}`);
            try {
              const emojiData = {
                userId,
                imageUri: filePath,
                alias,
                roomId: room._id,
              };
              const emoji = await createEmojiItem(emojiData);
              log.info({ emoji }, 'emoji uploaded');
              return res.status(201).send(emoji);
            } catch (err) {
              log.fatal({ err }, 'failed to create emoji document');
              return res.status(500).send(errors.ERR_SRV);
            }
          });
        } catch (err) {
          log.fatal({ err }, 'error fetching room');
          return res.status(500).send(err);
        }
      });
    });
  });

  req.pipe(busboy);
};
