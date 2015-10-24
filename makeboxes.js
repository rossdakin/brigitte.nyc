var IMAGE_COUNT = 47; // 0-indexed filenames
var MIN_WIDTH = 204; //($(window).width() / 3);
var MIN_LOAD_TIME = 2000;
var INIT_COUNT = 12;
var NEW_COUNT = 2;
var reservedNumbers = {};
var preloadedNumbers = [];

// https://gist.github.com/eikes/3925183
function imgpreload(imgs, callback) {
  "use strict";
  var loaded = 0;
  var images = [];
  imgs = Object.prototype.toString.apply( imgs ) === '[object Array]' ? imgs : [imgs];
  var inc = function() {
    loaded += 1;
    if ( loaded === imgs.length && callback ) {
      callback( images );
    }
  };
  for ( var i = 0; i < imgs.length; i++ ) {
    images[i] = new Image();
    images[i].onabort = inc;
    images[i].onerror = inc;
    images[i].onload = inc;
    images[i].src = imgs[i];
  }
}

function randomColor() {
  return '#' +
    Math.floor(Math.random() * 256).toString(16) +
    Math.floor(Math.random() * 256).toString(16) +
    Math.floor(Math.random() * 256).toString(16);
}

function buildImagePath(n) {
  return 'images/' + n + '.jpg';
}

function preloadBoxes(count, callback) {
  var paths = [];

  for (var i = 0; i < count; i++) {
    var n = reserveNumber();
    var path = buildImagePath(n)
    paths.push(path);
    preloadedNumbers.push(n);
  }

  imgpreload(paths, callback)
}

function fetchReservedNumber() {
  return preloadedNumbers.pop() || reserveNumber();
}

function makeBoxes(count) {
  var boxes = [];

  for (var i = 0; i < count; i++) {
    var box = document.createElement('div');
    var n = fetchReservedNumber();

    box.className = 'box size' +
      Math.ceil(Math.random() * 3) +
      Math.ceil(Math.random() * 2);

    box.style.backgroundImage = 'url("' + buildImagePath(n) + '")';

    boxes.push(box);
  }

  return boxes;
};

function clearReserveNumbers() {
  reservedNumbers = {};
}

function reserveNumber() {
  if (Object.keys(reservedNumbers).length + 1 >= IMAGE_COUNT) {
    // start over
    clearReserveNumbers();
  }

  var i = null;

  while (!i || reservedNumbers[i]) {
    i = Math.floor(Math.random() * IMAGE_COUNT).toString();
  }

  reservedNumbers[i] = true;

  return i;
}

var contentLoaded = false;
function loadContent() {
  if (contentLoaded) {
    return;
  }

  contentLoaded = true;

  $('.content-wrapper').fadeIn(1000);
}

var postInitCalled = false;
function postInit() {
  // idempotent for grins
  if (postInitCalled) {
    return;
  }
  postInitCalled = true;

  $('#loading').fadeOut('slow', function() {

    var initBoxes = makeBoxes(INIT_COUNT);
    $('#container')
      .prepend(initBoxes)
      .nested({
        animate: true,
        animationOptions: {
          speed: 200,
          complete: loadContent
        },
        minWidth: MIN_WIDTH
      })
      .nested('prepend', initBoxes);

    preloadBoxes(NEW_COUNT);
    window.interval = window.setInterval(function() {
      var boxes = makeBoxes(NEW_COUNT);
      $('#container').prepend(boxes).nested('prepend', boxes);
      preloadBoxes(NEW_COUNT)
    }, 5000);
  });
}

$(function() {
  // we want to invoke postInit once preloaded AND min load time has elapsed

  var preloaded = false;
  var minLoadTimeElapsed = false;

  // don't worry about canceling, just make postInit idempotent
  window.setTimeout(function() {
    minLoadTimeElapsed = true;
    if (preloaded) {
      postInit();
    }
  }, MIN_LOAD_TIME);

  preloadBoxes(INIT_COUNT, function() {
    preloaded = true;
    if (minLoadTimeElapsed) {
      postInit();
    }
  });
});
