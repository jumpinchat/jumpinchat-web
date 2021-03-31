require('core-js/stable');

const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

console.log = () => {};
Enzyme.configure({ adapter: new Adapter() });
