const SSD1306 = require('./ssd1306');
const rotary = require('./rotary');

var cnt = 0;

function onEvent(value) {
  if (value === 'CW')
    cnt++;
  else
    cnt--;

  lcd.print2at(2, 8, ("   " + cnt).slice(-3));
}

const rot = new rotary(20, 26, 21, onEvent);

const lcd = new SSD1306(1, 16, 19);

lcd.clear();
lcd.display(1);
// lcd.invert(1);

lcd.printat(0, 0, 'IP: 192.168.102.123');

lcd.print2at(2, 2, 'X: 123');
lcd.print2at(4, 2, 'Y:  34');
lcd.print2at(6, 2, 'Z: 240');

process.on('SIGINT', function () {
  rot.close();
  lcd.close();
});
