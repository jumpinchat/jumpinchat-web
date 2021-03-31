const log = require('../../../utils/logger.util')({ name: 'updateRequest' });
const { findById } = require('../ageVerification.utils');
const { applyTrophy } = require('../../trophy/trophy.utils');
const { getUserById } = require('../../user/user.utils');
const ageVerificationConstants = require('../ageVerification.const');
const email = require('../../../config/email.config');
const {
  ageVerifyApprovedTemplate,
  ageVerifyRejectedTemplate,
  ageVerifyDeniedTemplate,
} = require('../../../config/constants/emailTemplates');

function handleApprove(userId) {
  return applyTrophy(userId, 'TROPHY_AGE_VERIFIED', async (err) => {
    if (err) {
      log.fatal({ err }, 'error applying verified trophy');
      return;
    }

    log.info({ userId }, 'age verified trophy applied');

    try {
      const user = await getUserById(userId, { lean: false });

      if (!user) {
        log.error({ userId }, 'user not found');
      }

      user.attrs.ageVerified = true;

      user.save((err) => {
        if (err) {
          log.fatal({ err }, 'error saving user');
          return;
        }

        email.sendMail({
          to: user.auth.email,
          subject: 'Age verification approved',
          html: ageVerifyApprovedTemplate({
            user,
          }),
        }, (err, info) => {
          if (err) {
            log.fatal({ err }, 'failed to send verification email');
            return;
          }

          log.debug('verification email sent');
        });
      });
    } catch (err) {
      log.fatal({ err }, 'failed to get user ID');
    }
  });
}

async function handleReject(userId, reason) {
  try {
    const user = await getUserById(userId, { lean: true });

    email.sendMail({
      to: user.auth.email,
      subject: 'Age verification rejected',
      html: ageVerifyRejectedTemplate({
        user,
        reason,
      }),
    }, (err, info) => {
      if (err) {
        log.fatal({ err }, 'failed to send verification email');
        return;
      }

      log.debug('verification email sent');
    });
  } catch (err) {
    log.fatal({ err }, 'failed to get user ID');
  }
}

async function handleDeny(userId) {
  try {
    const user = await getUserById(userId, { lean: true });

    email.sendMail({
      to: user.auth.email,
      subject: 'Age verification denied',
      html: ageVerifyDeniedTemplate({
        user,
      }),
    }, (err) => {
      if (err) {
        log.fatal({ err }, 'failed to send verification email');
        return;
      }

      log.debug('verification email sent');
    });
  } catch (err) {
    log.fatal({ err }, 'failed to get user ID');
  }
}

module.exports = async function updateRequest(req, res) {
  const { id } = req.params;
  const { status } = req.query;
  const { reason } = req.body;

  log.debug({ id, status, reason });

  if (!status) {
    return res.status(400).send({
      error: 'ERR_INVALID',
      message: 'status missing',
    });
  }

  try {
    const request = await findById(id);
    log.debug({ request });

    request.status = status;
    request.reason = reason;
    request.updatedAt = Date.now();

    request.save((err, updatedRequest) => {
      if (err) {
        log.fatal({ err }, 'error saving request');
        return res.status(500).send();
      }

      switch (status) {
        case ageVerificationConstants.statuses.APPROVED:
          handleApprove(updatedRequest.user);
          break;
        case ageVerificationConstants.statuses.REJECTED:
          handleReject(updatedRequest.user, reason);
          break;
        case ageVerificationConstants.statuses.DENIED:
          handleDeny(updatedRequest.user);
          break;
        default:
          log.error('missing status');
          return res.status(400);
      }

      return res.status(200).send(request);
    });
  } catch (err) {
    log.fatal({ err }, 'error fetching requests');
    return res.status(500).send();
  }
};
