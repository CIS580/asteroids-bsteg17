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
