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

// If you change this, update the CSS
var CELLS_PER_ROW = 6;
// If you change this, update the CSS
var CANVAS_SIZE = 128;
var CANVAS_SCALE = 8;
var BITMAP_SIZE = 16;

var TRUNCATE_ROWS_AT = 1200;
var TRUNCATE_ROWS_TO = 600;

var LINE_ORIGIN_OFFSET_X = 0;
var LINE_ORIGIN_OFFSET_Y = 0;
var LINE_RANGE_X = CANVAS_SIZE - LINE_ORIGIN_OFFSET_X;
var LINE_RANGE_Y = CANVAS_SIZE - LINE_ORIGIN_OFFSET_Y;
var LINE_CAP = 'round';
var LINE_WIDTH = 1.5;
var LINE_COLOUR = 'black';
var line_delay = 1;

var conn;
var join_drawings = true;
var previous_points;
var previous_canvas;

var canvasToGlobal = function (canvas, point) {
    var rect = canvas.getBoundingClientRect();
    return {x: point.x + rect.left, y: point.y + rect.top}
};

var globalToCanvas = function (canvas, point) {
    var rect = canvas.getBoundingClientRect();
    return {x: point.x - rect.left, y: point.y - rect.top}
};

var drawLine = function (ctx, from, to) {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
};

// Destructive update of points list (removes members)

var drawLines = function (ctx, points) {
  var from = points.shift();
  var to = points[0];
  drawLine(ctx, from, to);
  if(points.length > 1) {
    setTimeout(function () { drawLines(ctx, points); },
               line_delay);
  }
};

// Destructive update of values in co-ordinate objects

var scaleCoords = function (coords) {
  coords.forEach(function(coord) {
    coord.x = LINE_ORIGIN_OFFSET_X + (coord.x * LINE_RANGE_X);
    coord.y = LINE_ORIGIN_OFFSET_Y + (coord.y * LINE_RANGE_Y);
  });
};

var drawHash = function (canvas, hash) {
  var ctx = canvas.getContext('2d');
  ctx.lineCap = LINE_CAP;
  ctx.lineWidth = LINE_WIDTH;
  ctx.strokeStyle = LINE_COLOUR;
  var coords = toCoordinates(hash);
  scaleCoords(coords);
  if(join_drawings) {
    if(previous_points) {
      // These only need to be stable *relatively*
      // so if the canvas or row position is being animated, that's fine as
      // it will move the other canvas/row the same amount.
      var previous_ctx = previous_canvas.getContext('2d');
      // Draw a line from the end of the previous path...
      drawLine(previous_ctx, previous_points[previous_points.length - 1],
              globalToCanvas(previous_canvas,
                            canvasToGlobal(canvas, coords[0])));
      // ...to the start of the new one.
      var previous_end = globalToCanvas(canvas,
                                        canvasToGlobal(previous_canvas,
                                                       previous_points[previous_points.length - 1]));
      drawLine(ctx, previous_end, coords[0])
    }
    previous_points = coords;
    previous_canvas = canvas;
  }
  drawLines(ctx, coords);
};

var currentRowIsOdd = function () {
  return ! (($('.row').size() - 1)% 2);
};

var currentCanvas = function () {
  var canvas;
  if (currentRowIsOdd()) {
    canvas = $('canvas:last')[0];
  } else {
    canvas = $('.row:last canvas:first')[0];
  }
  return canvas
};

var manageRows = function () {
  // Trim rows to avoid filling up memory
  var numRows = $('.row').size();
  if (numRows >= TRUNCATE_ROWS_AT) {
    var remove = $(".row:lt(" + (TRUNCATE_ROWS_TO - numRows) + ")");
    remove.slideUp('fast',function() { remove.remove(); });
  }
  // If the current row is full, append a new one
  var updatedNumRows = $('.row:last .cell').size();
  if ((updatedNumRows >= CELLS_PER_ROW) || (updatedNumRows == 0)) {
    var classes = "row";
    // Alternate left and right aligned/flowing rows
    if (currentRowIsOdd()) {
      classes += " row-right-align";
    }
    $('#transactions-inner').append('<div class="' + classes +'"></div>');
    var row = $('.row:last')
    row.hide();
    $('html, body').animate({scrollTop: $(document).height()}, 'slow');
    row.fadeIn('fast');
  }
};

var appendCellToRow = function (cell) {
  var row = $('.row:last');
  if (currentRowIsOdd()) {
    row.append(cell);
  } else {
    row.prepend(cell);
  }
};

var appendHash = function (hash) {
  //console.log(hash);
  // Don't add too many elements to the page, we don't want to hog memory
  /*if ($('.cell').size() >= TRUNCATE_BLOCKS_AT) {
    var remove = $(".cell:lt(" + TRUNCATE_BLOCKS_BY + ")");
    remove.slideUp('fast',function() { remove.remove(); });
  }*/
  manageRows();
  var cell = '<span class="cell">' + transactionHashToA(hash)
           + '<canvas width="' + CANVAS_SIZE + '" height="' + CANVAS_SIZE
           + '"></canvas></a></span>'
  //$('#transactions-inner').append(cell);
  appendCellToRow(cell);
  var canvas = currentCanvas();
  drawHash(canvas, hash);
  /*$('.cell:last').hide();
  $('html, body').animate({scrollTop: $(document).height()}, 'slow');
  $('.cell:last').fadeIn('slow');*/
};


var initConnection = function (spec) {
  conn = new ReconnectingWebSocket('wss://ws.blockchain.info/inv');
  conn.onopen = function () {
    // Should assert conn and err
    conn.send(spec);
  };
  conn.onmessage = function (e) {
    var data = $.parseJSON(e.data);
    var hash = data.x.hash;
    appendHash(hash);
  };
  conn.onerror = function (e) {
    console.log(e);
  };
};

var init = function (spec, time_between_lines, join) {
  line_delay = time_between_lines;
  join_drawings = join;
  initConnection(spec);
};

// @license-end