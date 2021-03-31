import escapeRegExp from 'lodash/escapeRegExp';

export const getUserMentioned = (message, handle, username) => {
  let usernameReg = '';
  if (username) {
    usernameReg = `|${escapeRegExp(username)}`;
  }

  const reg = `@(${escapeRegExp(handle)}${usernameReg})`;
  return message.match(new RegExp(reg));
};

export const getRoleMentioned = (message, role) => {
  const reg = `@(${escapeRegExp(role)})`;
  return message.match(new RegExp(reg));
};

export default null;
