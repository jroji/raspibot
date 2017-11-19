const CONFIG        = require('./environment.js');
const Robot         = require('./Robot.js');
const ImageAnalyzer = require('./ImageAnalyzer.js');
const firebase      = require('firebase');

firebase.initializeApp(CONFIG.firebase);

const ordersRef = firebase.database().ref('orders');
const imagesRef = firebase.database().ref('labels');

const robot = new Robot(ordersRef);
//const imageAnalyzer = new ImageAnalyzer(imagesRef);

//imageAnalyzer.setImage('https://cdn-images-1.medium.com/fit/c/200/200/0*j9i4MuiHL7VuyYNf.jpeg');