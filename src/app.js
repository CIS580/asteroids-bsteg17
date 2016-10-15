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
