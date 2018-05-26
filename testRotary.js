const rotary = require('./rotary');

function onEvent(value) {
  console.log(value);
}

const rot = new rotary(20, 26, 21, onEvent);

process.on('SIGINT', function () {
  rot.close();
});
