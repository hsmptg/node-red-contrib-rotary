const Gpio = require('onoff').Gpio;

class rotary {
  constructor(a, b, sw, cb) {
    var self = this;
    self.a =  new Gpio(a,  'in', 'rising');
    self.b =  new Gpio(b,  'in');
    self.sw = new Gpio(sw, 'in', 'falling', {debounceTimeout: 10});
    self.cb = cb;
    self.sw.watch(function (err, value) {
      if (err) {
        throw err;
      }
      self.cb("SW");
    });
    self.a.watch(function (err, value) {
      if (err) {
        throw err;
      }
      if (self.b.readSync()) {
        self.cb("CW");
      }
      else {
        self.cb("CCW");
      }
    });
  }

  close() {
    var self = this;
    self.a.unexport();
    self.b.unexport();
    self.sw.unexport();
  }
};

module.exports = rotary;
