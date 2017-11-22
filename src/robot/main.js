const CONFIG        = require('./environment.js');
const Robot         = require('./Robot.js');
const ImageAnalyzer = require('./ImageAnalyzer.js');
const firebase      = require('firebase');

firebase.initializeApp(CONFIG.firebase);
const firebaseApp = firebase.database();

const ordersRef = firebaseApp.ref('orders');
const imagesRef = firebaseApp.ref('labels');
const timeRef = firebaseApp.ref('lastImage');

const skynet = new Robot(ordersRef);
const imageAnalyzer = new ImageAnalyzer(imagesRef, timeRef);
imageAnalyzer.capture();