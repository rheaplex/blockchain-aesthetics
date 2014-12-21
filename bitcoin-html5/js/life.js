/**
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2014  Rhea Myers
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

var ROWS = 16;
var COLUMNS = 16;
var CELL_SIZE = 10;
var TURN_DURATION = 1000;

var CELLS_COUNT = ROWS * COLUMNS;
var LIVE = true;
var DEAD = false;

var MAX_GENERATION = 100;

// Oh, JavaScript

var mod = function(a, b) {
  return ((a % b) + b) % b;
};

var Board = function(canvas, hash) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.animation_start_time = 0;
  this.animation_current_generation = 0;
  this.initBoard(hash);
};

Board.prototype.coordsToIndex = function(x, y) {
  return mod(x, COLUMNS) + (mod(y, ROWS) * COLUMNS);
};

Board.prototype.getCell = function(x, y) {
  return this.board[this.coordsToIndex(x, y)];
};

Board.prototype.setCell = function(x, y, state) {
  this.board[this.coordsToIndex(x, y)] = state;
};

Board.prototype.initBoard = function(hash) {
  var bits = bitValues(hash);
  this.board = new Array();
  for (var i = 0; i < CELLS_COUNT; i++) {
    if (bits[i]) {
      this.board[i] = LIVE;
    } else {
      this.board[i] = DEAD;
    }
  }
};

Board.prototype.nextGenerationBoard = function() {
  var new_board = new Array();
  for (var y = 0; y <= ROWS; y++) {
    for (var x = 0; x <= COLUMNS; x++) {
      new_board[this.coordsToIndex(x, y)] =  this.nextCellState(x, y);
    }
  }
  this.board = new_board;
};

Board.prototype.nextCellState = function(x, y) {
  var current_state = this.getCell(x, y);
  var adjacent = this.adjacentCount(x, y);
  var next_state = current_state;
  if ((current_state == LIVE) && (adjacent < 2)) {
    next_state = DEAD;
  } else if ((current_state == LIVE) && (adjacent > 3)) {
    next_state = DEAD;
  } else if ((current_state == DEAD) && (adjacent == 3)) {
    next_state = LIVE;
  }
  return next_state;
};

Board.prototype.adjacentCount = function (x, y) {
  var count = 0;
  count += this.getCell(x - 1, y - 1);
  count += this.getCell(x,     y - 1);
  count += this.getCell(x + 1, y - 1);
  count += this.getCell(x - 1, y);
  count += this.getCell(x + 1, y);
  count += this.getCell(x - 1, y + 1);
  count += this.getCell(x,     y + 1);
  count += this.getCell(x + 1, y + 1);
  return count;
};

Board.prototype.drawCells = function() {
  for(var y = 0; y < ROWS; y++) {
    for(var x = 0; x < COLUMNS; x++) {
      if(this.getCell(x, y) == LIVE) {
        this.ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
};

Board.prototype.drawBoard = function() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.drawCells();
};

Board.prototype.maybeUpdateBoard = function() {
  var updated = false;
  var now = new Date().getTime();
  var generation = Math.floor((now - this.animation_start_time) / TURN_DURATION);
  if (generation > this.animation_current_generation) {
    this.nextGenerationBoard()
    this.animation_current_generation = generation;
    updated = true;
  }
  return updated;
};

Board.prototype.animationLoop = function() {
  var updated = this.maybeUpdateBoard();
  if (updated) {
    this.drawBoard();
  }
  var self = this;
  if (this.animation_current_generation < MAX_GENERATION) {
    requestAnimationFrame(function() { self.animationLoop(); });
  }
};

Board.prototype.startAnimating = function() {
  this.animation_current_generation = 0;
  this.animation_start_time = new Date().getTime();
  this.drawBoard();
  this.animationLoop();
};
