var IMAGE_COUNT = 47; // 0-indexed filenames
var MIN_WIDTH = 204 //($(window).width() / 3);
var reservedNumbers = {};

function randomColor() {
  return '#' +
    Math.floor(Math.random() * 256).toString(16) +
    Math.floor(Math.random() * 256).toString(16) +
    Math.floor(Math.random() * 256).toString(16);
}

function makeBoxes(count) {
  var boxes = [];

  for (var i = 0; i < count; i++) {
    var box = document.createElement('div');
    var n = reserveNumber();

    if (!n) {
      window.clearInterval(window.interval);
      location.reload();
    }

    box.className = 'box size' +
      Math.ceil(Math.random() * 3) +
      Math.ceil(Math.random() * 2);

    box.style.backgroundImage = 'url("images/' + n + '.jpg")';

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
  var initBoxes = makeBoxes(15);
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

  window.interval = window.setInterval(function() {
    var boxes = makeBoxes(2);
    $('#container').prepend(boxes).nested('prepend', boxes);
  }, 5000);
});
