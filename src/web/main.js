(() => {

  const init = function() {

    const config = {
      apiKey: "",
      authDomain: "raspibot-21ac3.firebaseapp.com",
      databaseURL: "https://raspibot-21ac3.firebaseio.com",
      storageBucket: "raspibot-21ac3.appspot.com",
    };

    firebase.initializeApp(config);

    const ordersRef = firebase.database().ref('orders');
    const labelsRef = firebase.database().ref('labels');
    const imageRef = firebase.database().ref('lastImage');
    storage = firebase.storage();

    ordersRef.on('value', ordersListener);
    labelsRef.on('value', labelsListener);
    imageRef.on('value', () => { listenAndUpdateImage(storage); });

    setButtonListeners(ordersRef);
  }

  const listenAndUpdateImage = (storage) => {
    storage.ref('raspicamera.jpg').getDownloadURL().then(function(url) {
      document.querySelector("img").setAttribute('src', url);
    });
  };

  const ordersListener = function(snapshot) {
    let active = document.querySelector('.main__button--active');
    let selected = document.querySelector('#' + snapshot.val().direction);
    if (active) {
      active.classList.remove('main__button--active');
      active.disabled = false;
    }
    if (selected) {
      selected.classList.add('main__button--active');
      selected.disabled = true;
    }
  };

  const labelsListener = function(snapshot) {
    listenAndUpdateImage(storage);
    let labels = snapshot.val();
    let html = '';

    labels.forEach(function(element) {
      let elem = '<li class="aside__label"><span>' + element.description + '</span><span>' + element.score + '</span></li>';
      html = html + elem;
    }, this);

    document.querySelector('#labelList').innerHTML = html;
  }

  const setButtonListeners = function(ref) {
    document.querySelectorAll('button').forEach(function(button) {
      button.addEventListener('click', function(ev) {
        ref.set({direction: ev.target.id});
      });
    });
  }

  init();
})();