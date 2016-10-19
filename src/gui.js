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
