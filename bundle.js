(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Asteroid = require('./asteroid.js');
const GUI = require('./gui.js');

/* Global variables */
var canvas = document.getElementById('screen');
var gui = new GUI();
var game = new Game(canvas, update, render);
var player; 
var asteroids = [];
var level = 0;
var score = 0;

var levelInit = function(level) {
  player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
  asteroids = Asteroid.initAsteroids(10 + (level * 2), canvas);
}

var gameOver = function() {
  document.getElementsByTagName("body")[0].innerHTML = "GAME OVER";
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
  if (player.lives == 0) { 
	  document.getElementsByTagName("body")[0].innerHTML = "GAME OVER";
	  return;
  } 
  if (asteroids.length == 0) { 
    score += 100;
    levelInit(++level); 
  }
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
  gui.render(score, player.lives, level);
}

},{"./asteroid.js":2,"./game.js":3,"./gui.js":4,"./player.js":7}],2:[function(require,module,exports){
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

Asteroid.minRadius = 20;

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
      self.asteroidCollision(asteroids[i]);
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
  if ( Helpers.circlesOverlap(self, player) ) self.playerCollision(player);
}

Asteroid.prototype.asteroidCollision = function(asteroid2) {
  var self = this;
  console.log("asteroid collision");
  var newVelocities = Helpers.postCollisionVectors(self, asteroid2);
  self.velocity = newVelocities[0];
  asteroid2.velocity = newVelocities[1];
  self.position.x += self.velocity.x;
  self.position.y += self.velocity.y;
  asteroid2.position.x += asteroid2.velocity.x;
  asteroid2.position.y += asteroid2.velocity.y;
  var snd = new Audio("assets/collision.wav"); // buffers automatically when created
  snd.play();
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
  if (self.radius / 2 < Asteroid.minRadius) return;
  // make two smaller asteroids
  asteroids.push(new Asteroid(Helpers.vectorOperation(self.position, self.velocity, "plus"), Helpers.perpVector(self.velocity, "left"), self.radius / 2));
  asteroids.push(new Asteroid(Helpers.vectorOperation(self.position, self.velocity, "minus"), Helpers.perpVector(self.velocity, "right"), self.radius / 2));
  var snd = new Audio("assets/explosion.wav"); // buffers automatically when created
  snd.play();
}

Asteroid.prototype.playerCollision = function(player) {
  // console.log("player collision");
  player.lives -= 1;
  player.position = Helpers.randomPosition(canvas);
  player.velocity.x = 0;
  player.velocity.y = 0;
  var snd = new Audio("assets/explosion.wav"); // buffers automatically when created
  snd.play();
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

},{"./helpers.js":5}],3:[function(require,module,exports){
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
"use strict";

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Player class
 */
module.exports = exports = GUI;

var canvas = document.getElementById("screen");

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function GUI() {};

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
GUI.prototype.render = function(score, lives, level) {
  var ctx = canvas.getContext('2d');
  var fontSize = 20;
  ctx.font = fontSize+"px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Score: "+score, 0, fontSize);
  ctx.fillText("Lives: "+lives, 160, fontSize);
  ctx.fillText("Level: "+level, 240, fontSize);
}

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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
  this.radius = 5;
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
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

},{}],7:[function(require,module,exports){
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
  this.radius  = 20;
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;

  this.lasers = [];

  this.lives = 3;

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
  var snd = new Audio("assets/laser.wav"); // buffers automatically when created
  snd.play();
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

},{"./laser.js":6}]},{},[1]);
