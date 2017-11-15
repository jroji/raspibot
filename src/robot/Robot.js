
const CONFIG   = require('./environment.js');
const async = require('async');
const firebase = require('firebase');
//const gpio  = require('pi-gpio');
const gpio = {open: () => {}, write: () => {}};

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
      leftFront: 11,
      leftBack: 12,
      rightFront: 15,
      rightBack: 16
    };

    for (let motor of Object.keys(motors)) {
      gpio.open(motors[motor], "output");
    }

    return motors;
  }

  goForward() {
    async.parallel([
      gpio.write(this.motors.leftFront, 1),
      gpio.write(this.motors.rightFront, 1)
    ]);
  }

  goBackwards() {
    async.parallel([
      gpio.write(this.motors.leftBack, 1),
      gpio.write(this.motors.rightBack, 1)
    ]);
  }

  goLeft() {
    gpio.write(this.motors.leftFront, 1);
  }

  goRight(){
    gpio.write(this.motors.rightFront, 1);
  }

  stop() {
    /*async.parallel([
      gpio.write(this.motors.leftFront, 0),
      gpio.write(this.motors.leftBack, 0),
      gpio.write(this.motors.rightFront, 0),
      gpio.write(this.motors.rightBack, 0)
    ]);*/
  } 
}

module.exports = Robot;