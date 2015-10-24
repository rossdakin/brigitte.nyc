var IMAGE_COUNT = 47; // 0-indexed filenames
var MIN_WIDTH = 204 //($(window).width() / 3);
var INIT_COUNT = 15;
var NEW_COUNT = 2;
var reservedNumbers = {};
var preloadedNumbers = [];

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
  var n = reserveNumber();
  var image = new Image();
  image.src = buildImagePath(n);

  preloadedNumbers.push(n);

  if (callback) {
    callback();
  }
}

function fetchReservedNumber() {
  return preloadedNumbers.pop() || reserveNumber();
}

function makeBoxes(count) {
  var boxes = [];

  for (var i = 0; i < count; i++) {
    var box = document.createElement('div');
    var n = fetchReservedNumber();

    if (!n) {
      window.clearInterval(window.interval);
      location.reload();
    }

    box.className = 'box size' +
      Math.ceil(Math.random() * 3) +
      Math.ceil(Math.random() * 2);

    box.style.backgroundImage = 'url("' + buildImagePath(n) + '")';

    boxes.push(box);
  }

  return boxes;
};

function reserveNumber() {
  if (Object.keys(reservedNumbers).length + 1 >= IMAGE_COUNT) {
    return null;
  }

  var i = null;

  while (!i || reservedNumbers[i]) {
    i = Math.floor(Math.random() * IMAGE_COUNT).toString();
  }

  reservedNumbers[i] = true;

  return i;
}

$(function() {
  preloadBoxes(INIT_COUNT, function() {
    var initBoxes = makeBoxes(INIT_COUNT);
    $('#container')
      .prepend(initBoxes)
      .nested({
        animate: true,
        animationOptions: {
          speed: 100,
          duration: 80
        },
        minWidth: MIN_WIDTH
      })
      .nested('prepend', initBoxes);

    preloadBoxes(NEW_COUNT)
    window.interval = window.setInterval(function() {
      var boxes = makeBoxes(NEW_COUNT);
      $('#container').prepend(boxes).nested('prepend', boxes);
      preloadBoxes(NEW_COUNT)
    }, 5000);
  });
});
