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
