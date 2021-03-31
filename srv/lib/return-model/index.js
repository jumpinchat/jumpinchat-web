/**
 * Created by vivaldi on 09/11/2014.
 */


module.exports = function (error, data, message) {
  this.error = error || null;
  this.data = data || {};
  this.message = message || null;

  return {
    error: this.error,
    data: this.data,
    message: this.message,
  };
};
