const SSD1306 = require('./ssd1306');

const lcd = new SSD1306(1, 16, 19);

lcd.clear();
lcd.display(1);
// lcd.invert(1);

lcd.printat(0, 0, 'IP: 192.168.102.123');

lcd.print2at(2, 2, 'X: 123');
lcd.print2at(4, 2, 'Y:  34');
lcd.print2at(6, 2, 'Z: 240');

process.on('SIGINT', function () {
  lcd.close();
});
