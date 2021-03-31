const request = require('request');
const log = require('../../../utils/logger.util')({ name: 'ytAPiQuery' });
const encodeUriParams = require('../../../utils/encodeUriParams');
const getCurrentCred = require('./getCurrentCred');

module.exports = async function ytApiQuery(url, urlParams, method = 'GET') {
  if (typeof urlParams !== 'object') {
    throw new TypeError('url params must be an object');
  }

  log.debug({ url, urlParams }, 'ytApiQuery');

  const apiKey = await getCurrentCred({ hasExpired: false });

  log.debug({ apiKey }, 'got current cred');

  return new Promise((resolve, reject) => request({
    method,
    url: `${url}?${encodeUriParams({ ...urlParams, key: apiKey })}`,
    json: true,
  }, (err, response, body) => {
    if (err) {
      log.error({ err }, 'error fetching yt search results');

      return reject(err);
    }

    if (response.statusCode >= 400) {
      log.warn({ body }, `error code from yt api: ${response.statusCode}`);

      if (body.error && body.error.errors) {
        const [error] = body.error.errors;

        if (error.reason === 'dailyLimitExceeded' || error.reason === 'quotaExceeded') {
          // attempt to rotate API keys
          log.error({ error }, 'Youtube quota exceeded');

          const e = new Error();

          e.name = 'ExternalProviderError';
          e.message = 'YouTube quota exceeded. Quota will be reset at midnight PST';
          return reject(e);
        }
      }

      return reject();
    }

    return resolve(body.items);
  }));
};
