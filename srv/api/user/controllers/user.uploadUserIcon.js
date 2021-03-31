const Busboy = require('busboy');
const log = require('../../../utils/logger.util')({ name: 'uploadUserIcon' });
const { getUserById } = require('../user.utils');
const {
  convertImages,
  mergeBuffers,
  s3Upload,
  isValidImage,
  getExtFromMime,
} = require('../../../utils/utils');

const config = require('../../../config/env');
const errors = require('../../../config/constants/errors');

module.exports = function uploadUserIcon(req, res) {
  let busboy;
  let hasErr = false;
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

  if (String(req.user._id) !== req.params.userId) {
    log.warn('User ID and ident cookie do not match');
    return res.status(401).send();
  }

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

      convertImages(mergeBuffers(dataArr), dimensions, (err, convertedImage) => {
        if (err) {
          log.fatal({ err }, 'failed to convert images');
          return res.status(500).send(err);
        }

        getUserById(req.params.userId, (err, user) => {
          if (err) {
            log.fatal('error fetching user', { err });
            return res.status(500).send(err);
          }

          const filePath = `user-icons/${user.username}.${getExtFromMime(mimeType)}`;

          log.debug('uploading image to s3');

          s3Upload(convertedImage, filePath, (err, data) => {
            if (err) {
              log.fatal('upload to s3 failed', { err });
              return res.status(500).send();
            }

            log.info(`upload done: ${filePath}`);

            user.settings.userIcon = `${filePath}?t=${Date.now()}`;

            user.save((err) => {
              if (err) {
                log.fatal('saving user failed', { err });
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
