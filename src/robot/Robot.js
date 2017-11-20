
const CONFIG   = require('./environment.js');
const async = require('async');
const firebase = require('firebase');
const gpio  = require('rpi-gpio');

class Robot {

  constructor(firebaseRef) {
    if (!firebaseRef) {
      firebase.initializeApp(CONFIG.firebase);
      firebaseRef = firebase.database().ref('orders');
    }

    this.direction;
    this.motors = this.initPins();
    this.firebaseRef = firebaseRef;
    this.listenOrders();
  }

  listenOrders() {
    this.firebaseRef.on('value', (snapshot) => {
      const direction = snapshot.val().direction;
      this.updateDirection(direction);
    });
  }

  updateDirection(direction) {
    console.log('GOING ' + direction);
    switch (direction) {
      case 'F': {
        this.stop(() => { this.goForward(); });
        break;
      }
      case 'L': {
        this.stop(() => { this.goLeft(); });
        break;
      }
      case 'R': {
        this.stop(() => { this.goRight(); });
        break;
      }
      case 'B': {
        this.stop(() => { this.goBackwards(); });
        break;
      }
      default: {
        this.stop(() => {});
      }
    }
  }

  initPins() {
    const motors = {
      leftFront: 16,
      leftBack: 13,
      rightFront: 18,
      rightBack: 15
    };

    async.parallel([
      (callback) => { gpio.setup(motors.leftFront, gpio.DIR_OUT, callback); },
      (callback) => { gpio.setup(motors.leftBack, gpio.DIR_OUT, callback); },
      (callback) => { gpio.setup(motors.rightFront, gpio.DIR_OUT, callback); },
      (callback) => { gpio.setup(motors.rightBack, gpio.DIR_OUT, callback); },
    ]);

    return motors;
  }

  goForward() {
    async.parallel([
      (callback) => { gpio.write(this.motors.leftFront, true, callback)},
      (callback) => { gpio.write(this.motors.rightFront, true, callback)}
    ]);
  }

  goBackwards() {
    async.parallel([
      (callback) => { gpio.write(this.motors.leftBack, true, callback)},
      (callback) => { gpio.write(this.motors.rightBack, true, callback)}
    ]);
  }

  goLeft() {
    gpio.write(this.motors.rightFront, true);
  }

  goRight(){
    gpio.write(this.motors.leftFront, true);
  }
  
  stop(afterCallback) {
    async.parallel([
      (callback) => { gpio.write(this.motors.leftFront, false, callback)},
      (callback) => { gpio.write(this.motors.leftBack, false, callback)},
      (callback) => { gpio.write(this.motors.rightFront, false, callback)},
      (callback) => { gpio.write(this.motors.rightBack, false, callback)},
    ], () => { afterCallback() });
  }

  closePins() {
    gpio.destroy(function() {
        console.log('All pins unexported');
    });
  }
}

module.exports = Robot;