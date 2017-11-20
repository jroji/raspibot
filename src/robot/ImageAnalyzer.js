
const CONFIG   = require('./environment.js');
const axios    = require('axios');
const firebase = require('firebase');
const googleStorage = require('@google-cloud/storage');

class ImageAnalyzer {

  constructor(firebaseRef) {
    if (!firebaseRef) {
      firebase.initializeApp(CONFIG.firebase);
      firebaseRef = firebase.database().ref('labels');
    }
    // Image URI to be analyzed by Cloud Vision
    this.firebaseRef = firebaseRef;
    const storage = googleStorage({
      projectId: CONFIG.GCId,
      keyFilename: CONFIG.keyFilename
    });

    this.bucket = storage.bucket(CONFIG.bucketName);
    this.bucket.upload('./test.jpg', (err, file) => {
      console.log(file);
      console.log(`https://storage.googleapis.com/${CONFIG.GCId}.appspot.com/${file.name}`);
      this.setImage(`https://storage.googleapis.com/${CONFIG.GCId}.appspot.com/${file.name}`);
    });
  }

  /**
   * Set the image to be analyzed
   * @param {string} imageURI
   */
  setImage(imageURI) {
    this.imageURI = imageURI;
    this.analyzeImage(this.imageURI);
  }

  /**
   * Analayze image requesting to gc uri
   * @param {String} imageURI
   */
  async analyzeImage(imageURI) {
    let response = await axios.post(
      CONFIG.GCVUri(CONFIG.GCKey),
      this.constructRequest(this.imageURI, 'LABEL_DETECTION')
    );
    console.log(response.data.responses[0]);
    this.firebaseRef.set(response.data.responses[0].labelAnnotations);
  }

  /**
   * Construct request body for the petition
   * @param {string} image
   * @param {string} type
   */
  constructRequest(image = this.imageURI, type = 'LABEL_DETECTION') {
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