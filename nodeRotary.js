const rotary = require('./rotary');

module.exports = function(RED) {
  function RotaryNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    const rot = new rotary(config.apin, config.bpin, config.swpin, function cb(value) {
      var msg = {
        topic: "sw",
        payload: value
      };
      node.send(msg);
    });

    node.on("close", function () {
      rot.close();
    });
  }
  RED.nodes.registerType("rotary", RotaryNode);
}
