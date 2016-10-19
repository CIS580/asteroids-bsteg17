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

Helpers.circlesOverlap = function(circle1, circle2) {
  var sumOfRadii = circle1.radius + circle2.radius;
  var distance = Math.sqrt( Math.pow(circle2.position.x - circle1.position.x, 2) + Math.pow(circle2.position.y - circle1.position.y, 2) );
  return distance < sumOfRadii;
}

Helpers.perpVector = function(vector, direction) {
  if (direction == "left") return {x: -vector.y, y: vector.x};
  if (direction == "right") return {x: vector.y, y: -vector.x};
}

Helpers.vectorOperation = function(v1, v2, op) {
  switch(op) {
    case "plus":
      return {x: v1.x + v2.x, y: v1.y + v2.y};
    case "minus":
      return {x: v1.x - v2.x, y: v1.y - v2.y};
  }
}

Helpers.getMagnitude = function(vector) {
  return Math.sqrt( Math.pow(vector.x, 2) + Math.pow(vector.y, 2) );
}

Helpers.dotProduct = function(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
}

Helpers.getAngle = function(v1, v2) {
  return Math.acos( Helpers.dotProduct(v1, v2) / ( Helpers.getMagnitude(v1) * Helpers.getMagnitude(v2) ) );
}

Helpers.multiplyVectorByScalar = function(vector, scalar) {
  return {x: vector.x * scalar, y: vector.y * scalar};
}

Helpers.postCollisionVectors = function(a, b) {
  var newA, newB;
  newA = {x:0, y:0};
  newB = {x:0, y:0};
  newA.x = (a.velocity.x * (a.radius - b.radius) + (2 * b.radius * b.velocity.x)) / (a.radius + b.radius);
  newA.y = (a.velocity.y * (a.radius - b.radius) + (2 * b.radius * b.velocity.y)) / (a.radius + b.radius);
  newB.x = (b.velocity.x * (b.radius - a.radius) + (2 * a.radius * a.velocity.x)) / (a.radius + b.radius);
  newB.y = (b.velocity.y * (b.radius - a.radius) + (2 * a.radius * a.velocity.y)) / (a.radius + b.radius);
  return [newA, newB];
}
