if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = function(callback) {
    return setTimeout(callback, 1000 / 60);
  };
}

function Animate(options) {
  var start = Date.now();

  window.requestAnimationFrame(function _animate() {
    var timeFraction = (Date.now() - start) / options.duration;
    if (timeFraction > 1) timeFraction = 1;

    var progress = options.timing(timeFraction);
    options.draw(progress);

    if (timeFraction < 1) {
      window.requestAnimationFrame(_animate);
    } else {
      options.onEnd && options.onEnd();
    }
  });
}

Animate.Timings = {
  linear: function(timeFraction) {
    return timeFraction;
  },
  circle: function(timeFraction) {
    return 1 - Math.sin(Math.acos(timeFraction));
  },
  circle2: function(timeFraction) {
    return 1 - (1 - timeFraction ** 2) ** 0.5;
  },
  bounce: function(timeFraction) {
    for (var a = 0, b = 1; (a += b), (b /= 2); ) {
      if (timeFraction >= (7 - 4 * a) / 11) {
        return (
          -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2)
        );
      }
    }
  },

  power: function(x, timeFraction) {
    return Math.pow(timeFraction, x);
  },
  back: function(x, timeFraction) {
    return Math.pow(timeFraction, 2) * ((x + 1) * timeFraction - x);
  },
  elastic: function(x, timeFraction) {
    return (
      Math.pow(2, 10 * (timeFraction - 1)) *
      Math.cos(((20 * Math.PI * x) / 3) * timeFraction)
    );
  }
};

Animate.Utils = {
  makeEaseOut: function(timing) {
    return function easeOut(timeFraction) {
      return 1 - timing(1 - timeFraction);
    };
  },
  makeEaseInOut: function(timing) {
    return function easeInOut(timeFraction) {
      if (timeFraction < 0.5) return timing(2 * timeFraction) / 2;
      else return 1 - timing(2 * (1 - timeFraction)) / 2;
    };
  }
};

export default Animate;
