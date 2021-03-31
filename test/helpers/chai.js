/**
 * Created by Sissy on 08/07/14.
 */

console.log("test/helpers/chai.js");
var chai = require('chai');

chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;