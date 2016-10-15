module.exports = exports = Helpers;

function Helpers() {};

Helpers.randomVector = function() {	
  return {
    x: this.randomNumberBetween(-3, 3),
    y: this.randomNumberBetween(-3, 3)
  }
}

Helpers.randomRadius = function() {	
  return this.randomNumberBetween(10, 60);
}

Helpers.randomNumberBetween = function(lower, upper) {
  return Math.floor( Math.random() * (upper - lower) + lower );
}

Helpers.randomPosition = function(canvas) {
  return {
    x: Helpers.randomNumberBetween(0, canvas.width),
    y: Helpers.randomNumberBetween(0, canvas.height)
  }
}
