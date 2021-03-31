const log = require('../../utils/logger.util')({ name: 'emailTemplates' });

const findMissingVars = (expected, received) => Object
  .keys(received)
  .filter(v => expected.indexOf(v) === -1);

const commonStyles = `
  <style>
  @font-face {
    font-family: 'Dosis';
    font-style: normal;
    font-weight: 600;
    src: local('Dosis SemiBold'), local('Dosis-SemiBold'), url(https://fonts.gstatic.com/s/dosis/v7/O6SOu9hYsPHTU43R17NS5XYhjbSpvc47ee6xR_80Hnw.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215;
  }

  p {
    margin: 1em 0;
  }

  .container {
    width: 100%;
    background-color: #dddddd;
    font-family: arial, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    text-align: center;
    color: #333333;
  }

  .wrapper {
    display: inline-block;
    max-width: 42em;
    margin: 64px 16px;
    background-color: #F7F7F7;
    border-radius: 3px;
    overflow: hidden;
    text-align: left;
  }

  .header {
    height: 2em;
    background-color: #1B8CB5;
    color: #FFFFFF;
    line-height: 2em;
    font-family: 'Dosis', sans-serif;
    font-size: 1.5em;
    font-weight: 600;
    text-align: center;
  }

  .header a {
    color: inherit;
    text-decoration: none;
  }

  .footer {
    margin: 1em 0 0;
    font-size: 0.85em;
    color: #999999;
    text-align: center;
  }

  .content {
    padding: 1em 1em;
  }

  .buttonContainer {
    padding: 1em 0;
    text-align: center;
  }

  .button {
    display: inline-block;
    padding: 0.5em 0.75em;
    background: #1B8CB5;
    border-radius: 2px;

    font-weight: 600;
    text-decoration: none;
    color: #FFFFFF;
  }

  .text--muted {
    color: #999999;
  }
  </style>
`;

const header = `
  <div class="header"><a href="https://jumpin.chat">JumpInChat</a></div>
`;

module.exports.senders = {
  default: 'JumpInChat noreply@jumpin.chat',
  admin: 'Admin at JumpInChat contact@example.com',
};

module.exports.signUpTemplate = function signUpTemplate(vars) {
  const expectedVars = ['username', 'token'];
  const missingVars = findMissingVars(expectedVars, vars);

  if (missingVars.length) {
    log.error('missing variables:', missingVars.join(', '));
    return false;
  }

  return `
    ${commonStyles}

    <div class="container">
      <div class="wrapper">
        ${header}
        <div class="content">
          <p>Thanks for joining JumpInChat <strong>${vars.username}</strong>!</p>

          <p>
            But before you jump in, please confirm this email address is yours using the link below.
          </p>

          <div class="buttonContainer">
            <a href="https://jumpin.chat/verify-email/${vars.token}" class="button">Verify your email address</a>
          </div>

          <p>
            or visit
            <br />
            <a href="https://jumpin.chat/verify-email/${vars.token}">https://jumpin.chat/verify-email/${vars.token}</a>
          </p>

          <p>
            Verifying your email will allow you to reset your password in case you forget it.
            <br />
            Doing so is also required if you wish for your room to appear on the public room list.
            It will also allow us to let you know about any important updates to the site. Don't worry, there'll be no spam.
          </p>


          <h3>Your new room</h3>
          <p>
            Your new chatroom is up and running, check it out:
            <a href="https://jumpin.chat/${vars.username}">https://jumpin.chat/${vars.username}</a>
          </p>

          <p>
            You can also change your <a href="https://jumpin.chat/settings/room">room settings</a> and
            create a simple bio for your public profile in your <a href="https://jumpin.chat/settings/profile">profile settings</a>.
          </p>
        </div>
      </div>
    </div>
  `;
};

module.exports.resetPasswordTemplate = function resetPasswordTemplate(vars) {
  const expectedVars = ['username', 'token'];
  const missingVars = findMissingVars(expectedVars, vars);

  if (missingVars.length) {
    log.error('missing variables:', missingVars.join(', '));
    return false;
  }

  return `
    ${commonStyles}

    <div class="container">
      <div class="wrapper">
        ${header}
        <div class="content">
          <p>
            Hello <strong>${vars.username}</strong>, looks like you tried to reset your password
          </p>

          <p>
            In order to reset your password, just follow the link below and you&rsquo;ll be
            redirected to a form where you can input a new one.
          </p>

          <div class="buttonContainer">
            <a href="https://jumpin.chat/password-reset/reset/${vars.token}" class="button">Reset password</a>
          </div>

          <p class="text--muted">
            If you didn&rsquo;t expect this message, feel free to ignore it.
          </p>
        </div>
      </div>
    </div>
  `;
};

module.exports.reportTemplate = function reportTemplate(vars) {
  return `
    ${commonStyles}

    <div class="container">
      <div class="wrapper">
        ${header}
        <div class="content">
          <p>
            Report for ${vars.reason} in room <a href="https://jumpin.chat/admin/rooms/${vars.room.name}">${vars.room.name}</a> at ${vars.createdAt}
          </p>

          <h3>Description</h3>
          <p>
            ${vars.description}
          </p>

          <h3>Target user</h3>
          <dl>
            <dh>handle</dh>
            <dd>${vars.target.handle}</dd>

            <dh>list ID</dh>
            <dd>${vars.target.userListId}</dd>

            <dh>user ID</dh>
            <dd><a href="https://jumpin.chat/admin/users/${vars.target.userId}">${vars.target.userId}</a></dd>
          </dl>

          <h3>Reporting user</h3>
          <dl>
            <dh>handle</dh>
            <dd>${vars.reporter.handle}</dd>

            <dh>list ID</dh>
            <dd>${vars.reporter.userListId}</dd>

            <dh>user ID</dh>
            <dd><a href="https://jumpin.chat/admin/users/${vars.reporter.userId}">${vars.reporter.userId}</a></dd>
          </dl>

          <div class="buttonContainer">
            <a href="https://jumpin.chat/admin/reports/${vars._id}" class="button">Open report</a>
          </div>
        </div>
      </div>
    </div>
  `;
};

module.exports.siteModReportTemplate = function siteModReportTemplate(vars) {
  return `
    ${commonStyles}

    <div class="container">
      <div class="wrapper">
        ${header}
        <div class="content">
          <p>
            Report for ${vars.reason} in room ${vars.room.name} at ${vars.createdAt}
          </p>

          <h3>Description</h3>
          <p>
            ${vars.description}
          </p>

          <h3>Target user</h3>
          <dl>
            <dh>handle</dh>
            <dd>${vars.target.handle}</dd>
          </dl>

          <h3>Reporting user</h3>
          <dl>
            <dh>handle</dh>
            <dd>${vars.reporter.handle}</dd>

          <div class="buttonContainer">
            <a href="https://jumpin.chat/sitemod/reports/${vars._id}" class="button">Open report</a>
          </div>
        </div>
      </div>
    </div>
  `;
};


module.exports.messageReportTemplate = function messageReportTemplate(vars) {
  return `
    ${commonStyles}

    <div class="container">
      <div class="wrapper">
        ${header}
        <div class="content">
          <p>
            Report for ${vars.reason}
          </p>


          <div class="buttonContainer">
            <a href="https://jumpin.chat/admin/reports/messages/${vars._id}" class="button">Open report</a>
          </div>
        </div>
      </div>
    </div>
  `;
};

module.exports.ageVerifyTemplate = function ageVerifyTemplate({ userId, verificationId }) {
  return `
    ${commonStyles}

    <div class="container">
      <div class="wrapper">
        ${header}
        <div class="content">
          <p>
            User <a href="/admin/users/${userId}">${userId}</a> submitted an age verification
            request
          </p>
          <p>
            Request ID: <a href="/admin/ageverify/${verificationId}">${verificationId}</a>
          </p>
        </div>
      </div>
    </div>
  `;
};

module.exports.ageVerifyApprovedTemplate = function ageVerifyApprovedTemplate({ user }) {
  return `
    ${commonStyles}

    <div class="container">
      <div class="wrapper">
        ${header}
        <div class="content">
          <p>
            Hello <strong>${user.username}</strong>!
          </p>

          <p>
            Your age verification request has been approved!
          </p>

          <p>
            You are now able to broadcast in age restricted rooms. However, be aware
            that in regular rooms you must still abide by the <a href="/terms#prohibitions">terms and conditions</a>.
            Failing to do so may result in a broadcast ban.
          </p>
        </div>
      </div>
    </div>
  `;
};

module.exports.ageVerifyRejectedTemplate = function ageVerifyRejectedTemplate({ user, reason }) {
  return `
    ${commonStyles}

    <div class="container">
      <div class="wrapper">
        ${header}
        <div class="content">
          <p>
            Hello <strong>${user.username}</strong>!
          </p>

          <p>
            Unfortunately your age verification request was rejected.
          </p>

          <p>
            Reason: ${reason}
          </p>

          <p>
            Please make sure the photos clearly show the required information and
            <a href="https://jumpin.chat/ageverify">resubmit your request</a>.
          </p>
        </div>
      </div>
    </div>
  `;
};

module.exports.ageVerifyDeniedTemplate = function ageVerifyDeniedTemplate({ user }) {
  return `
    ${commonStyles}

    <div class="container">
      <div class="wrapper">
        ${header}
        <div class="content">
          <p>
            Hello <strong>${user.username}</strong>!
          </p>

          <p>
            Unfortunately your age verification request was denied.
          </p>

          <p>
            The reason for this is that according to the information you have submitted,
            you are younger than the required age of 18.
          </p>

          <p>
            You will be able to resubmit no sooner than two weeks from the date of this message,
            preferably when you are at least 18 years old.
          </p>
        </div>
      </div>
    </div>
  `;
};

module.exports.customEmail = function customEmail(vars) {
  const expectedVars = ['username', 'message', 'unsubToken'];
  const missingVars = findMissingVars(expectedVars, vars);

  if (missingVars.length) {
    log.error('missing variables:', missingVars.join(', '));
    return false;
  }

  return `
    ${commonStyles}

    <div class="container">
      <div class="wrapper">
        ${header}
        <div class="content">
          <p>
            Hello <strong>${vars.username}</strong>!
          </p>

          ${vars.message}
        </div>
        <footer class="content footer">
          If you no longer wish to receive email updates,
          <a href="https://jumpin.chat/api/user/unsubscribe/${vars.unsubToken}">you can unsubscribe</a>, or disable email
          communications in your <a href="https://jumpin.chat/settings/user">user settings</a> page.
        </footer>
      </div>
    </div>
  `;
};

module.exports.newMessageTemplate = function newMessageTemplate({ user, sender }) {
  return `
    ${commonStyles}

    <div class="container">
      <div class="wrapper">
        ${header}
        <div class="content">
          <p>
            Hello <strong>${user.username}</strong>!
          </p>

          <p>
            You&apos;ve received a new message from ${sender.username}.
          </p>

          <div class="buttonContainer">
            <a href="https://jumpin.chat/messages/${sender.username}" class="button">Open inbox</a>
          </div>
        </div>
        <footer class="content footer">
          If you no longer wish to receive message notifications you can
          update your email preferences in your <a href="https://jumpin.chat/settings/user">user settings</a> page.
        </footer>
      </div>
    </div>
  `;
};
