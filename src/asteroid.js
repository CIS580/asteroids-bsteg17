"use strict";
var canvas = document.getElementsByTagName('canvas')[0];
var Helpers = require('./helpers.js');

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Asteroid class
 */
module.exports = exports = Asteroid;

/**
 * @constructor Asteroid
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Asteroid(position, velocity, radius) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.state = "idle";
  this.position = position; 
  this.velocity = velocity;
  this.radius = radius;

  this.image = new Image();
  this.image.src = "assets/asteroid.png";
}

Asteroid.prototype.collisionDetect = function(asteroids, lasers, player) {
  self = this;
  self.asteroidCollisionDetect(asteroids);
  self.laserCollisionDetect(asteroids, lasers);
  self.playerCollisionDetect(player);
}

Asteroid.prototype.asteroidCollisionDetect = function(asteroids) {
  var self = this;
  var ownIndex = asteroids.indexOf(self);
  for(var i = 0; i < asteroids.length; i++) {
    if ( i == ownIndex ) continue;
    if ( Helpers.circlesOverlap(self, asteroids[i]) ) {
      self.asteroidCollision();
    }
  }
}

Asteroid.prototype.laserCollisionDetect = function(asteroids, lasers) {
  var self = this;
  for(var i = 0; i < lasers.length; i++) {
    if ( Helpers.circlesOverlap(self, lasers[i]) ) {
      self.laserCollision(asteroids, lasers[i]);
      break;
    }
  }
}

Asteroid.prototype.playerCollisionDetect = function(player) {
  var self = this;
  if ( Helpers.circlesOverlap(self, player) ) self.playerCollision();
}

Asteroid.prototype.asteroidCollision = function() {
  // console.log("asteroid Collision"); 
}

Asteroid.prototype.laserCollision = function(asteroids, laser) {
  console.log("laser collision");
  var self = this;
  // destroy laser
  var laserIndex = laser.player.lasers.indexOf(laser);
  laser.player.lasers.splice(laserIndex, 1);
  // split asteroid in two
  var asteroidIndex = asteroids.indexOf(self);
  asteroids.splice(asteroidIndex, 1);
  // make two smaller asteroids
  asteroids.push(new Asteroid(Helpers.vectorOperation(self.position, self.velocity, "plus"), Helpers.perpVector(self.velocity, "left"), self.radius / 2));
  asteroids.push(new Asteroid(Helpers.vectorOperation(self.position, self.velocity, "minus"), Helpers.perpVector(self.velocity, "right"), self.radius / 2));
}

Asteroid.prototype.playerCollision = function() {
  // console.log("player collision");
}


/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Asteroid.prototype.update = function(time) {
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  if(this.position.x < 0) this.position.x += this.worldWidth;
  if(this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if(this.position.y < 0) this.position.y += this.worldHeight;
  if(this.position.y > this.worldHeight) this.position.y -= this.worldHeight;
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Asteroid.prototype.render = function(time, ctx) {
  ctx.drawImage(this.image, 
		this.position.x - (this.radius), this.position.y - (this.radius), 
		this.radius * 2, this.radius * 2);
}

Asteroid.initAsteroids = function(numAsteroids) {
  var asteroids = [];
  for(var i = 0; i < numAsteroids; i++) {
    asteroids.push( new Asteroid( Helpers.randomPosition(canvas), Helpers.randomVector(), Helpers.randomRadius()) );
  }
  return asteroids;
}
