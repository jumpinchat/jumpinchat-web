const Busboy = require('busboy');
const log = require('../../../utils/logger.util')({ name: 'uploadDisplayPic' });
const { getRoomByName } = require('../room.utils');
const {
  convertImages,
  mergeBuffers,
  s3Upload,
  isValidImage,
  getExtFromMime,
} = require('../../../utils/utils');

const config = require('../../../config/env');
const errors = require('../../../config/constants/errors');

module.exports = function uploadDisplayPic(req, res) {
  let busboy;
  let hasErr = false;
  try {
    busboy = new Busboy({
      headers: req.headers,
      limits: {
        fileSize: config.uploads.roomCover.size,
        files: 1,
      },
    });
  } catch (e) {
    log.error({ e }, 'error constructing busboy');
    return res.status(500).send(errors.ERR_SRV);
  }

  busboy.on('file', (fieldname, file, fileName, encoding, mimeType) => {
    if (!isValidImage(mimeType)) {
      log.error(`${mimeType} is not a valid image`);
      return res.status(415).send(errors.ERR_FILE_TYPE);
    }

    const dataArr = [];

    file.on('data', (data) => {
      dataArr.push({ data, length: data.byteLength });
    });

    file.on('limit', () => {
      hasErr = true;
      log.error('File has hit limit');
      return res.status(415).send(errors.ERR_FILE_LIMIT);
    });

    file.on('end', () => {
      log.debug('file end');

      if (hasErr) {
        return null;
      }

      if (!dataArr.length) {
        return res.status(400).send();
      }

      const dimensions = {
        width: config.uploads.roomCover.width,
        height: config.uploads.roomCover.height,
      };

      convertImages(mergeBuffers(dataArr), dimensions, (err, convertedImage) => {
        if (err) {
          log.fatal({ err }, 'failed to convert images');
          return res.status(500).send(errors.ERR_SRV);
        }

        getRoomByName(req.params.room, (err, room) => {
          if (err) {
            log.fatal({ err }, 'error fetching user');
            return res.status(500).send(errors.ERR_SRV);
          }

          if (!room) {
            return res.status(404).send(errors.ERR_NO_ROOM);
          }

          if (String(room.attrs.owner) !== req.signedCookies['jic.ident']) {
            log.warn(
              {
                room: room.name,
                owner: String(room.attrs.owner),
                userAttempting: req.signedCookies['jic.ident'],
              },
              'Non-owner tried to upload room display pic',
            );
            return res.status(401).send(errors.ERR_NOT_OWNER);
          }

          const filePath = `room-display/display-${room.name}.${getExtFromMime(mimeType)}`;

          s3Upload(convertedImage, filePath, (err, data) => {
            if (err) {
              log.fatal('upload to s3 failed', { err });
              return res.status(500).send(errors.ERR_SRV);
            }

            log.info(`Uploaded display image: ${filePath}`);

            room.settings.display = filePath;

            room.save((err) => {
              if (err) {
                log.fatal({ err }, 'saving user failed');
                return res.status(500).send();
              }

              return res.status(200).send({ url: filePath });
            });
          });
        });
      });
    });
  });

  req.pipe(busboy);
};
