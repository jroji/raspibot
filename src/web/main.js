
var init = function() {
  var config = {
    apiKey: "",
    authDomain: "raspibot-21ac3.firebaseapp.com",
    databaseURL: "https://raspibot-21ac3.firebaseio.com"
  };
  
  firebase.initializeApp(config);

  const ordersRef = firebase.database().ref('orders');
  const labelsRef = firebase.database().ref('labels');
  
  ordersRef.on('value', ordersListener);
  labelsRef.on('value', labelsListener);

  setButtonListeners(ordersRef);
}

var ordersListener = function(snapshot) {
  var active = document.querySelector('.main__button--active');
  var selected = document.querySelector('#' + snapshot.val().direction);
  if (active) {
    active.classList.remove('main__button--active');
    active.disabled = false;
  }
  if (selected) {
    selected.classList.add('main__button--active');
    selected.disabled = true;
  }
};

var labelsListener = function(snapshot) {
  var labels = snapshot.val();
  var html = '';

  labels.forEach(function(element) {
    let elem = '<li class="aside__label"><span>' + element.description + '</span><span>' + element.score + '</span></li>';
    html = html + elem;
  }, this);

  document.querySelector('#labelList').innerHTML = html;
}

var setButtonListeners = function(ref) {
  document.querySelectorAll('button').forEach(function(button) {
    button.addEventListener('click', function(ev) {
      ref.set({direction: ev.target.id});
    });
  });
}

init();