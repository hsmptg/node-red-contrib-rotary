const fonts = require('./fonts');

const SSD1306_SETCONTRAST = 0x81
const SSD1306_DISPLAYALLON_RESUME = 0xA4
const SSD1306_DISPLAYALLON = 0xA5
const SSD1306_NORMALDISPLAY = 0xA6
const SSD1306_INVERTDISPLAY = 0xA7
const SSD1306_DISPLAYOFF = 0xAE
const SSD1306_DISPLAYON = 0xAF

const SSD1306_SETDISPLAYOFFSET = 0xD3
const SSD1306_SETCOMPINS = 0xDA

const SSD1306_SETVCOMDETECT = 0xDB

const SSD1306_SETDISPLAYCLOCKDIV = 0xD5
const SSD1306_SETPRECHARGE = 0xD9

const SSD1306_SETMULTIPLEX = 0xA8

const SSD1306_SETLOWCOLUMN = 0x00
const SSD1306_SETHIGHCOLUMN = 0x10

const SSD1306_SETSTARTLINE = 0x40

const SSD1306_MEMORYMODE = 0x20
const SSD1306_COLUMNADDR = 0x21
const SSD1306_PAGEADDR = 0x22

const SSD1306_COMSCANINC = 0xC0
const SSD1306_COMSCANDEC = 0xC8

const SSD1306_SEGREMAP = 0xA0

const SSD1306_CHARGEPUMP = 0x8D

const SSD1306_EXTERNALVCC = 0x1
const SSD1306_SWITCHCAPVCC = 0x2

const Gpio = require('onoff').Gpio;
const spi = require('spi-device');

class SSD1306 {
  constructor (spiPort, reset, dc) {
    var self = this;
    self.spi   = spi.openSync(0, spiPort);
    self.reset = new Gpio(reset, 'out');
    self.dc    = new Gpio(dc,    'out');

    self.reset.writeSync(1);
    self.reset.writeSync(0);
    self.reset.writeSync(1);

    self.sendCmd(SSD1306_DISPLAYOFF)                    // 0xAE
    self.sendCmd(SSD1306_SETDISPLAYCLOCKDIV)            // 0xD5
    self.sendCmd(0x80)                                  // the suggested ratio 0x80
    self.sendCmd(SSD1306_SETMULTIPLEX)                  // 0xA8
    self.sendCmd(0x3F)
    self.sendCmd(SSD1306_SETDISPLAYOFFSET)              // 0xD3
    self.sendCmd(0x0)                                   // no offset
    self.sendCmd(SSD1306_SETSTARTLINE | 0x0)            // line #0
    self.sendCmd(SSD1306_CHARGEPUMP)                    // 0x8D
    self.sendCmd(0x14)
    self.sendCmd(SSD1306_MEMORYMODE)                    // 0x20
    self.sendCmd(0x00)                                  // 0x0 act like ks0108
    self.sendCmd(SSD1306_SEGREMAP | 0x1)
    self.sendCmd(SSD1306_COMSCANDEC)
    self.sendCmd(SSD1306_SETCOMPINS)                    // 0xDA
    self.sendCmd(0x12)
    self.sendCmd(SSD1306_SETCONTRAST)                   // 0x81
    self.sendCmd(0xCF)
    self.sendCmd(SSD1306_SETPRECHARGE)                  // 0xd9
    self.sendCmd(0xF1)
    self.sendCmd(SSD1306_SETVCOMDETECT)                 // 0xDB
    self.sendCmd(0x40)
    self.sendCmd(SSD1306_DISPLAYALLON_RESUME)           // 0xA4
    self.sendCmd(SSD1306_NORMALDISPLAY)                 // 0xA6
  }

  display (on) {
    var self = this;
    if (on)
        self.sendCmd(SSD1306_DISPLAYON);
    else
        self.sendCmd(SSD1306_DISPLAYOFF);
  }

  invert (inv) {
    var self = this;
    if (inv)
        self.sendCmd(SSD1306_INVERTDISPLAY);
    else
        self.sendCmd(SSD1306_NORMALDISPLAY);
  }

  sendCmd (cmd) {
    var self = this;
    self.dc.writeSync(0);
    const message = [{
      sendBuffer: Buffer.from([cmd]), // Sent to read channel 5
      receiveBuffer: Buffer.alloc(1),              // Raw data read from channel 5
      byteLength: 1,
      speedHz: 20000 // Use a low bus speed to get a good reading from the TMP36
    }];
    self.spi.transferSync(message);
  }

  clear() {
    var self = this;
    self.sendCmd(SSD1306_COLUMNADDR)
    self.sendCmd(0)
    self.sendCmd(127)
    self.sendCmd(SSD1306_PAGEADDR)
    self.sendCmd(0)
    self.sendCmd(7)

    self.dc.writeSync(1);
    const message = [{
      sendBuffer: Buffer.alloc(128*8, 0),
      byteLength: 128*8,
      speedHz: 1000000
    }];
    self.spi.transferSync(message);
  }

  printat (row, col, msg) {
    var self = this;
    self.sendCmd(SSD1306_COLUMNADDR)
    self.sendCmd(1 + 6*col)
    self.sendCmd(126)
    self.sendCmd(SSD1306_PAGEADDR)
    self.sendCmd(row)
    self.sendCmd(row)

    self.dc.writeSync(1);
    var message = [{
      sendBuffer: Buffer.alloc(msg.length*6, 0),
      byteLength: msg.length*6,
      speedHz: 1000000
    }];

    for (var i = 0; i < msg.length; i++) {
      var f = 5*(msg.charCodeAt(i) - 32);
      var x = fonts.font.slice(f, f+5);
      x.copy(message[0].sendBuffer, 6*i);
    }
    self.spi.transferSync(message);
  }

  print2at (row, col, msg) {
    var self = this;
    self.sendCmd(SSD1306_COLUMNADDR)
    self.sendCmd(1 + 6*col)
    self.sendCmd(6*col + 12*msg.length)
    self.sendCmd(SSD1306_PAGEADDR)
    self.sendCmd(row)
    self.sendCmd(row+1)

    self.dc.writeSync(1);
    var message = [{
      sendBuffer: Buffer.alloc(msg.length*12, 0),
      byteLength: msg.length*12,
      speedHz: 1000000
    }];

    for (var i = 0; i < msg.length; i++) {
      var f = 20*(msg.charCodeAt(i) - 32);
      var x = fonts.font2.slice(f, f+10);
      x.copy(message[0].sendBuffer, 12*i);
    }
    self.spi.transferSync(message);

    for (var i = 0; i < msg.length; i++) {
      var f = 20*(msg.charCodeAt(i) - 32);
      var x = fonts.font2.slice(f+10, f+20);
      x.copy(message[0].sendBuffer, 12*i);
    }
    self.spi.transferSync(message);
  }

  close () {
    var self = this;
    self.spi.closeSync();
    self.reset.unexport();
    self.dc.unexport();
  }
}

module.exports = SSD1306;
