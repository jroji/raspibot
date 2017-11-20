
const CONFIG   = require('./environment.js');
const axios    = require('axios');
const firebase = require('firebase');
const googleStorage = require('@google-cloud/storage');
const spawn = require('child_process').spawn;
const fs = require('fs');

class ImageAnalyzer {

  constructor(firebaseRef) {
    this._firebaseRef = this._setFirebaseApp(firebaseRef, CONFIG);
    this.bucket = this._setGCloud(CONFIG);
    this.raspistill = spawn('raspistill', ['-w', '640', '-h', '480', '-q', '5', '-o', '/tmp/stream/pic.jpg', '-tl', '1000', '-t', '9999999', '-th', '0:0:0', '-n', '-rot', '180']);    
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
  _setFirebaseApp(firebaseRef, config) {
    if (!firebaseRef) {
      firebase.initializeApp(config.firebase);
      firebaseRef = firebase.database().ref('labels');
    }
    return firebaseRef;
  }

  /**
   * Start streaming
   */
  capture() {
    var args = ["-w", "640", "-h", "480", "-o", "./stream/image_stream.jpg", "-t", "999999999", "-tl", "100"];
    proc = spawn('raspistill', args);
    fs.watchFile('./stream/image_stream.jpg', function(current, previous) {
      this.bucket.upload('./test.jpg', (err, file) => {
        this.setImage(`https://storage.googleapis.com/${CONFIG.GCId}.appspot.com/${file.name}`);
      });
    });
  }

  /**
   * Set the image to be analyzed
   * @param {string} imageURI
   */
  _setImage(imageURI) {
    this.imageURI = imageURI;
    this.analyzeImage(this.imageURI);
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

new ImageAnalyzer();