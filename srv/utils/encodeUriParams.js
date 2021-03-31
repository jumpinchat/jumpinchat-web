module.exports = function encodeUriParams(params) {
  return Object.keys(params)
    .map(val => `${val}=${encodeURIComponent(params[val])}`)
    .join('&');
};
