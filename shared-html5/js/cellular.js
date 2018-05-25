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

// Animating this lags the browser(!), so generate in one go.

var CELL_SIZE = 1;

var ROW_LENGTH = 256;
var MAX_GENERATION = 256;

// Rule 30
//var PRODUCTIONS = [0, 1, 1, 1, 1, 0, 0, 0];
// Rule 110
var PRODUCTIONS = [0, 1, 1, 1, 0, 1, 1, 0];

var CURRENTLY_ANIMATING = [];

// Oh, JavaScript

var mod = function(a, b) {
  return ((a % b) + b) % b;
};

var Board = function(canvas, hash) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.current_generation = 0;
  this.cells = Array();
  var bits = bitValues(hash);
  for(var i = 0; i < ROW_LENGTH; i++) {
    this.cells[i] = bits[i];
  }
  this.drawNextRow();
  CURRENTLY_ANIMATING.push(this);
};

// From https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators

Board.prototype.binNum = function () {
  var nMask = 0, nFlag = 0, nLen = arguments.length > 32 ? 32 : arguments.length;
  for (nFlag; nFlag < nLen; nMask |= arguments[nFlag] << nFlag++);
  return nMask;
};

Board.prototype.rowColumnIndex = function(row, column) {
  return (row * ROW_LENGTH) + mod(column, ROW_LENGTH);
};

Board.prototype.getValue = function(row, column) {
  return this.cells[this.rowColumnIndex(row, column)];
};

Board.prototype.setValue = function(row, column, value) {
  this.cells[this.rowColumnIndex(row, column)] = value;
};

Board.prototype.nextValue = function(row, column) {
  var parents = this.binNum(this.getValue(row, column -1),
                            this.getValue(row, column),
                            this.getValue(row, column +1));
  return PRODUCTIONS[parents];
};

Board.prototype.createNextRow = function() {
  var parent = this.current_generation;
  this.current_generation++;
  for (var i = 0; i < ROW_LENGTH; i++) {
    this.setValue(this.current_generation, i, this.nextValue(parent, i));
  }
};

Board.prototype.drawNextRow = function() {
  for(var x = 0; x < ROW_LENGTH; x++) {
    if(this.getValue(this.current_generation, x)) {
      this.ctx.fillRect(x * CELL_SIZE, this.current_generation * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
};

Board.prototype.animationStep = function() {
  this.createNextRow();
  this.drawNextRow();
};

var removeFinishedAnimations = function () {
  var unfinished = [];
  CURRENTLY_ANIMATING.forEach(function(board) {
    if (board.current_generation < MAX_GENERATION) {
      unfinished.push(board);
    }
   });
  CURRENTLY_ANIMATING = unfinished;
};

var animationLoop = function() {
  CURRENTLY_ANIMATING.forEach(function(board) {
    board.animationStep();
  });
  removeFinishedAnimations();
  requestAnimationFrame(animationLoop);
};
