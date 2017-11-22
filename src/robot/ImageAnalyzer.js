
const CONFIG   = require('./environment.js');
const axios    = require('axios');
const firebase = require('firebase');
const googleStorage = require('@google-cloud/storage');
const spawn = require('child_process').spawn;
const fs = require('fs');
const Raspistill = require('node-raspistill').Raspistill;

/**
 * Receives or create a firebase reference. Take pictures and upload to GCS
 * @param {Object} firebaseRef: Firebase labels node reference
 */
class ImageAnalyzer {

  constructor(firebaseRef, timeRef) {
    this._firebaseRef = this._setFirebaseApp(firebaseRef, CONFIG, 'labels');
    this._timeRef = this._setFirebaseApp(timeRef, CONFIG, 'lastImage');
    this._bucket = this._setGCBucket(CONFIG);
    this.counter = 0;
    // Configure the camera in photo mode, with specified height and direction
    this.camera = new Raspistill({
        fileName: 'raspicamera',
        verticalFlip: true,
        width: 640,
        height: 480
    });
  }

  /**
   * Set and connect to GCloud Storage
   * @param {Object} config
   * @return {Object}
   */
  _setGCBucket(config) {
    const storage = googleStorage({
      projectId: config.GCId,
      keyFilename: config.keyFilename
    });
    return storage.bucket(config.bucketName);
  }

  /**
   * Set and connect to firebase
   * @param {*} firebaseRef
   * @return {Object}
   */
  _setFirebaseApp(firebaseRef, config, endpoint) {
    if (!firebaseRef) {
      firebase.initializeApp(config.firebase);
      firebaseRef = firebase.database().ref(endpoint);
    }
    return firebaseRef;
  }

  /**
   * Start streaming
   */
  async capture() {
    let photo = await this.camera.takePhoto();
    this._bucket.upload('./photos/raspicamera.jpg', (err, file) => {
      this._timeRef.set(Date.now());
      if (counter % 6 === 0) {
        this._setImage(`https://storage.googleapis.com/${CONFIG.GCId}.appspot.com/raspicamera.jpg`);
      }
      setTimeout(() => {
        this.counter++;
        this.capture();
      }, 1000);
    });
  }

  /**
   * Set the image to be analyzed
   * @param {string} imageURI
   */
  _setImage(imageURI) {
    this.imageURI = imageURI;
    this._analyzeImage(this.imageURI);
  }

  /**
   * Analayze image requesting to gc uri
   * @param {String} imageURI
   */
  async _analyzeImage(imageURI) {
    let response = await axios.post(
      CONFIG.GCVUri(CONFIG.GCKey),
      this._constructRequest(this.imageURI, 'LABEL_DETECTION')
    );
    this._firebaseRef.set(response.data.responses[0].labelAnnotations);
  }

  /**
   * Construct request body for the petition
   * @param {string} image
   * @param {string} type
   */
  _constructRequest(image = this.imageURI, type = 'LABEL_DETECTION') {
    return {
      "requests": [
        {
          "features": [
            {
              // TYPE OF THE DETECTION, LABEL BY DEFAULT
              "type": type
            }
          ],
          "image": {
            "source": {
              // IMAGE TO BE ANALYZED
              "imageUri": image
            }
          }
        }
      ]
    };
  }
}

module.exports = ImageAnalyzer;