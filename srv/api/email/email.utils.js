const dns = require('dns');
const request = require('request');
const log = require('../../utils/logger.util')({ name: 'email.utils' });
const blacklistModel = require('./blacklist.model');

const types = {
  BOUNCE: 'Bounce',
  COMPLAINT: 'Complaint',
};

const bounceTypes = {
  PERMANENT: 'Permanent',
  TEMPORARY: 'Transient',
};

const statusMap = {
  STATUS_PROHIBITED: '5.7.1',
  STATUS_DENIED: '5.4.1',
  STATUS_INVALID_DOMAIN: '5.4.4',
  STATUS_BAD_ADDRESS: '5.1.1',
  STATUS_TIMEOUT: '4.4.7',
};

const blacklistExpire = 1000 * 60 * 60 * 24 * 7;

function normalizeEmailErrorResponse(response) {
  if (response.notificationType === types.BOUNCE) {
    return {
      type: types.BOUNCE,
      recipients: response.bounce.bouncedRecipients.map(r => ({
        address: r.emailAddress,
        reason: r.diagnosticCode,
        status: r.status,
      })),
      subType: response.bounce.bounceType,
    };
  }

  return false;
}

function addBlackListItem(data) {
  try {
    log.info({ data }, 'adding email to blacklist');
    return blacklistModel.create(data);
  } catch (err) {
    log.fatal({ err }, 'failed to add email to blacklist');
    throw err;
  }
}

async function addToBlacklist(info) {
  const normalized = normalizeEmailErrorResponse(info);

  if (!normalized) {
    return false;
  }

  const recipient = normalized.recipients[0];
  const [, domain] = recipient.address.split('@');
  let addr = recipient.address;

  const shouldBlockDomain = (
    recipient.status === statusMap.STATUS_DENIED
    || recipient.status === statusMap.STATUS_INVALID_DOMAIN
  );


  if (shouldBlockDomain) {
    addr = `*@${domain}`;
  }

  const expires = normalized.subType === bounceTypes.TEMPORARY && !shouldBlockDomain
    ? Date.now() + blacklistExpire
    : null;

  const data = {
    type: normalized.subType,
    address: addr,
    domain,
    reason: recipient.reason,
    expiresAt: expires,
  };

  return addBlackListItem(data);
}

module.exports.addToBlacklist = addToBlacklist;

module.exports.getBlacklistItem = async function getBlacklistItem(address) {
  const [, domain] = address.split('@');

  try {
    return await blacklistModel
      .findOne({
        address: { $in: [`*@${domain}`, address] },
      })
      .lean(true)
      .exec();
  } catch (err) {
    log.fatal({ err }, 'failed to fetch blacklist item');
    throw err;
  }
};

function checkDomainMx(domain) {
  return new Promise((resolve, reject) => {
    dns.resolveMx(domain, (err, mx) => {
      if (err) {
        if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
          return resolve({
            valid: false,
            mx: [],
          });
        }

        return reject(err);
      }

      if (mx.length === 0) {
        return resolve({
          valid: false,
          mx,
        });
      }

      return resolve({
        valid: true,
        mx,
      });
    });
  });
}

module.exports.checkEmailDomain = function checkEmailDomain(address) {
  const [, domain] = address.split('@');
  return new Promise(async (resolve, reject) => {
    try {
      const result = await checkDomainMx(domain);
      if (result.valid) {
        return resolve();
      }

      const error = new Error();
      error.name = 'InvalidEmailDomainError';
      error.message = 'email domain does not have MX records';

      const blackListItem = {
        type: bounceTypes.PERMANENT,
        address: `*@${domain}`,
        domain,
        reason: 'Invalid domain',
        expiresAt: null,
      };

      log.warn({ address, domain }, 'email DNS check failed');

      try {
        await addBlackListItem(blackListItem);
      } catch (err) {
        log.fatal({ err }, 'failed to add blacklist item');
      }
      return reject(error);
    } catch (err) {
      log.error({ err }, 'error checking email domain');
      return reject(err);
    }
  });
};

module.exports.isSubscriptionConfirmation = function isSubscriptionConfirmation(headers) {
  return headers['x-amz-sns-message-type'] === 'SubscriptionConfirmation';
};

module.exports.handleSnsSubscription = function handleSnsSubscription(req, res) {
  return request(req.body.SubscribeURL, (err, response, body) => {
    if (err) {
      log.error({ err }, 'error confirming bounce notification subscription');
      return res.status(204).send();
    }

    if (response.statusCode >= 400) {
      log.error({ body }, 'bounce notification confirmation failed');
      return res.status(204).send();
    }

    log.info({ response: response.statusCode }, 'bounce notification subscription confirmed');
    return res.status(204).send();
  });
};


