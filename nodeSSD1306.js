const SSD1306 = require('./ssd1306');

module.exports = function(RED) {
  function LCDNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    const lcd = new SSD1306(config.spiport, config.resetpin, config.dcpin);
    lcd.clear();
    lcd.display(1);

    node.on('input', function(msg) {
      lcd.print2at(msg.payload.row, msg.payload.col, msg.payload.str);
    });

    node.on("close", function () {
      lcd.close();
    });
  }
  RED.nodes.registerType("ssd1306", LCDNode);
}
