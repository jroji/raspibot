
const CONFIG   = require('./environment.js');
const async = require('async');
const firebase = require('firebase');
const gpio  = require('pi-gpio');

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
      const direction = snapshot.val();
      this.updateDirection(direction);
    });
  }

  updateDirection(direction) {
    switch (direction) {
      case 'F': {
        this.goForward();
        break;
      }
      case 'L': {
        this.goLeft();
        break;
      }
      case 'R': {
        this.goRight();
        break;
      }
      case 'B': {
        this.goBackwards();
        break;
      }
      default: {
        this.stop();
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
      (callback) => { gpio.open(motors.leftFront, gpio.DIR_OUT, callback); },
      (callback) => { gpio.open(motors.leftBack, gpio.DIR_OUT, callback); },
      (callback) => { gpio.open(motors.rightFront, gpio.DIR_OUT, callback); },
      (callback) => { gpio.open(motors.rightBack, gpio.DIR_OUT, callback); },
    ]);

    return motors;
  }

  goForward() {
    async.parallel([
      gpio.write(this.motors.leftFront, true),
      gpio.write(this.motors.rightFront, true)
    ]);
  }

  goBackwards() {
    async.parallel([
      gpio.write(this.motors.leftBack, true),
      gpio.write(this.motors.rightBack, true)
    ]);
  }

  goLeft() {
    gpio.write(this.motors.rightFront, true);
  }

  goRight(){
    gpio.write(this.motors.leftFront, true);
  }

  stop() {
    async.parallel([
      gpio.write(this.motors.leftFront, false),
      gpio.write(this.motors.leftBack, false),
      gpio.write(this.motors.rightFront, false),
      gpio.write(this.motors.rightBack, false)
    ]);
  }

  closePins() {
    gpio.destroy(function() {
        console.log('All pins unexported');
    });
  }
}

module.exports = Robot;