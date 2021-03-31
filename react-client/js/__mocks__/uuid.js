/* global jest */
const uuid = jest.genMockFromModule('uuid');

uuid.v4 = () => '123';

module.exports = uuid;
