(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Asteroid = require('./asteroid.js');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player; 
var asteroids = [];
var level = 0;

var levelInit = function(level) {
  player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
  asteroids = Asteroid.initAsteroids(10 + (level * 2), canvas);
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
levelInit(level);
masterLoop(performance.now());

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  player.update(elapsedTime);
  player.lasers.forEach(function(laser){laser.update(elapsedTime)});
  asteroids.forEach(function(asteroid){asteroid.update(elapsedTime)});
  // collision detection
  asteroids.forEach(function(asteroid){asteroid.collisionDetect(asteroids, player.lasers, player)});
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.render(elapsedTime, ctx);
  player.lasers.forEach(function(laser){laser.render(ctx)});
  asteroids.forEach(function(asteroid){asteroid.render(elapsedTime, ctx)});
}

},{"./asteroid.js":2,"./game.js":3,"./player.js":6}],2:[function(require,module,exports){
"use strict";

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
function Asteroid(canvas) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.state = "idle";
  this.position = Helpers.randomPosition(canvas);
  this.velocity = Helpers.randomVector();
  this.radius  = Helpers.randomRadius();

  this.image = new Image();
  this.image.src = "assets/asteroid.png";
}

Asteroid.prototype.collisionDetect = function(asteroids, lasers, player) {
  self = this;
  self.asteroidCollisionDetect(asteroids);
  self.laserCollisionDetect(lasers);
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

Asteroid.prototype.laserCollisionDetect = function(lasers) {
  var self = this;
  for(var i = 0; i < lasers.length; i++) {
    if ( Helpers.circlesOverlap(self, lasers[i]) ) {
      self.laserCollision();
      break;
    }
  }
}

Asteroid.prototype.playerCollisionDetect = function(player) {
  var self = this;
  if ( Helpers.circlesOverlap(self, player) ) self.playerCollision();
}

Asteroid.prototype.asteroidCollision = function() {
   console.log("asteroid Collision"); 
}

Asteroid.prototype.laserCollision = function() {
  console.log("laser collision");
}

Asteroid.prototype.playerCollision = function() {
  console.log("player collision");
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

Asteroid.initAsteroids = function(numAsteroids, canvas) {
  var asteroids = [];
  for(var i = 0; i < numAsteroids; i++) {
    asteroids.push( new Asteroid( canvas ) );
  }
  return asteroids;
}

},{"./helpers.js":4}],3:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Laser class
 */
module.exports = exports = Laser;

/**
 * @constructor Laser
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Laser(player, canvas) {
  this.player = player;
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.angle = player.angle;
  this.position = {
    x: player.position.x - Math.sin(this.angle) * 10,
    y: player.position.y - Math.cos(this.angle) * 10
  };
  this.speed = 5;
  this.velocity = {
    x: -(Math.sin(this.angle) * this.speed),
    y: -(Math.cos(this.angle) * this.speed)
  };
  this.width = 3;
  this.height = 10;
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Laser.prototype.update = function(time) {
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  if(this.position.x < 0 ||
    this.position.x > this.worldWidth ||
    this.position.y < 0 ||
    this.position.y > this.worldHeight) {
      //detete the laser
      this.player.lasers.splice(this.player.lasers.indexOf(this), 1);
  }
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Laser.prototype.render = function(ctx) {
  ctx.save();
  // Draw player's ship
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(-this.angle);
  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, this.width, this.height);

  ctx.restore();
}

},{}],6:[function(require,module,exports){
"use strict";

const Laser = require('./laser.js');

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player(position, canvas) {
  this.canvas = canvas;
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.state = "idle";
  this.position = {
    x: position.x,
    y: position.y
  };
  this.velocity = {
    x: 0,
    y: 0
  }
  this.angle = 0;
  this.radius  = 64;
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;

  this.lasers = [];

  var self = this;
  window.onkeydown = function(event) {
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = true;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = true;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = true;
        break;
      case ' ':
	self.shootLaser();
	break;
    }
  }

  window.onkeyup = function(event) {
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = false;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = false;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = false;
        break;
    }
  }
}

Player.prototype.shootLaser = function() {
  this.lasers.push(new Laser(this, this.canvas)); 
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time) {
  // Apply angular velocity
  if(this.steerLeft) {
    this.angle += time * 0.005;
  }
  if(this.steerRight) {
    this.angle -= 0.1;
  }
  // Apply acceleration
  if(this.thrusting) {
    var acceleration = {
      x: Math.sin(this.angle),
      y: Math.cos(this.angle)
    }
    this.velocity.x -= acceleration.x;
    this.velocity.y -= acceleration.y;
  }
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
Player.prototype.render = function(time, ctx) {
  ctx.save();

  // Draw player's ship
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(-this.angle);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-10, 10);
  ctx.lineTo(0, 0);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.strokeStyle = 'white';
  ctx.stroke();

  // Draw engine thrust
  if(this.thrusting) {
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(5, 10);
    ctx.arc(0, 10, 5, 0, Math.PI, true);
    ctx.closePath();
    ctx.strokeStyle = 'orange';
    ctx.stroke();
  }
  ctx.restore();
}

},{"./laser.js":5}]},{},[1]);
