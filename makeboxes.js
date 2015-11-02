var IMAGE_COUNT = 47; // 0-indexed filenames
var MIN_WIDTH = 183;
var MIN_LOAD_TIME = 10000;
var INIT_COUNT = 15;
var NEW_COUNT = 2;
var IMAGE_SIZES = {
  '0': ['32'],
  '1': 's',
  '2': ['s', '12', '32'],
  '3': ['s', '12'],
  '4': ['s', '12', '32'],
  '5': 's',
  '6': 's',
  '7': 's',
  '8': ['s', '32'],
  '9': '32',
  '10': null,
  '11': 's',
  '12': ['s', '21', '32'],
  '13': '12',
  '14': null,
  '15': ['s', '32'],
  '16': ['32', 's'],
  '17': ['12', 's'],
  '18': 's',
  '19': 's',
  '20': ['s', '32'],
  '21': ['22'],
  '22': '31',
  '23': 's',
  '24': '12',
  '25': 's',
  '26': 's',
  '27': 's',
  '28': ['12', 's'],
  '29': 's',
  '30': ['32'],
  '31': null,
  '32': 's',
  '33': '12',
  '34': ['s', '12'],
  '35': ['s', '12'],
  '36': ['s', '12'],
  '37': ['s', '32'],
  '38': ['32', '31'],
  '39': 's',
  '40': ['s', '12'],
  '41': ['s', '12'],
  '42': ['12'],
  '43': 's',
  '44': ['12'],
  '45': '32',
  '46': ['32', 's']
};
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
    var size = IMAGE_SIZES[n] ||
        (Math.ceil(Math.random() * 3) + '' +
         Math.ceil(Math.random() * 2));

    size = Object.prototype.toString.apply(size) !== '[object Array]' ? size :
      size[Math.floor(Math.random() * size.length)];

    // let 's' be shorthand for square
    if (size == 's') {
      size = (['11', '22'])[Math.floor(Math.random() * 2)];
    }

    box.className = 'box size' + size;
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

function startBackground() {
  var initBoxes = makeBoxes(INIT_COUNT);
  $('#container')
    .prepend(initBoxes)
    .nested({
      animate: true,
      animationOptions: {
        speed: 200
      },
      minWidth: MIN_WIDTH
    })
    .nested('prepend', initBoxes);

  preloadBoxes(NEW_COUNT);
  window.interval = window.setInterval(function() {
    var boxes = makeBoxes(NEW_COUNT);
    $('#container').prepend(boxes).nested('prepend', boxes);
    preloadBoxes(NEW_COUNT)
  }, 6000);
}

var postInitCalled = false;
function postInit() {
  // idempotent for grins
  if (postInitCalled) {
    return;
  }
  postInitCalled = true;

  $('#loading').fadeOut(2000, function() {
    $('.content').addClass('visible');
    window.setTimeout(function() {
      $('.content').addClass('bordered');
      window.setTimeout(function() {
        $('.content').addClass('open');
        window.setTimeout(function() {
          $('.clock').fadeIn(1200);
          $('.content p').fadeIn(1200, startBackground);
        }, 1200);
      }, 800);
    }, 2000);
  });
}

$(function() {
  if (isMobile.any) {
    alert('Not mobile-friendly; please revisit from a computer.');
    return;
  }

  var date = new Date('2015-11-01T14:40:00');
  var seconds = 14998;
  $('.clock').FlipClock(seconds, {
    autoStart: false,
    clockFace: 'DailyCounter',
    countdown: true
  });

  $('#nyc').fadeIn(1500, function() {
    $('#bhb').fadeIn(1500, function() {
      $('#runner').addClass('moving');
    });
  });

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
