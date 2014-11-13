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

// Make sure these are multiples of the number of cells in a row
var TRUNCATE_BLOCKS_AT = 1200;
var TRUNCATE_BLOCKS_TO = 600;

var CANVAS_SIZE = 144;
var CANVAS_OFFSET = 8;
var CANVAS_SCALE = 8;
var CANVAS_COLOUR = 'white';
var BITMAP_SIZE = 16;

var BLUR_RADIUS = 4;
var MATCH_LINE_WIDTH = 2.5
var MATCH_LINE_COLOUR = 'red';

var conn;

var detectFace = function (canvas) {
  var matches = ccv.detect_objects(
    { "canvas" : ccv.grayscale(ccv.pre(canvas)),
      "cascade" : cascade,
      "interval" : 5,
      "min_neighbors" : 1 });
  return matches;
};

var drawMatches = function (ctx, matches) {
  // Just draw the first one
  // In testing, multiples were overlapping matches of the same feature
  var match = matches[0];
  //matches.forEach(function(match) {
  // Clamp to bitmap pixel boundaries
  var x = /*Math.round*/(match.x / CANVAS_SCALE) * CANVAS_SCALE;
  var y = /*Math.round*/(match.y / CANVAS_SCALE) * CANVAS_SCALE;
  var width = /*Math.round*/(match.width / CANVAS_SCALE) * CANVAS_SCALE;
  var height = /*Math.round*/(match.height / CANVAS_SCALE) * CANVAS_SCALE;
  ctx.lineWidth = MATCH_LINE_WIDTH;
  ctx.strokeStyle = MATCH_LINE_COLOUR;
  ctx.rect(x ? x : 1, y ? y : 1, width, height);
  ctx.stroke();
  //});
};

var drawHash = function (canvas, colours) {
  var ctx = canvas.getContext('2d');
  // White background for the blur. Should check colours from
  ctx.fillStyle = CANVAS_COLOUR;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
   for(var y = 0; y < BITMAP_SIZE; y++) {
    for (var x = 0; x < BITMAP_SIZE; x++) {
      // Slower than other alternatives, but clear
      ctx.fillStyle = colours[x + (y * BITMAP_SIZE)];
      ctx.fillRect(CANVAS_OFFSET + (x * CANVAS_SCALE),
                   CANVAS_OFFSET + (y * CANVAS_SCALE),
                   CANVAS_SCALE, CANVAS_SCALE);
    }
  }
  stackBlurCanvasRGB(ctx, 0, 0, CANVAS_SIZE, CANVAS_SIZE, BLUR_RADIUS);
  // Get the matches
  var matches = detectFace(canvas);
  // Soften the edges a tiny bit, as black edges are harsh
  //ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  //ctx.lineWidth = 2.5;
  //ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  // Then draw the matches *over* any softening
  if(matches.length > 0) {
    drawMatches(ctx, matches);
  } /*else {
      // No match? fade out
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }*/

};

var appendHash = function (hash) {
  //console.log(hash);
  // Don't add too many elements to the page, we don't want to hog memory
  var numCells = $('.cell').size();
  if (numCells >= TRUNCATE_BLOCKS_AT) {
    var remove = $(".cell:lt(" + (numCells - TRUNCATE_BLOCKS_TO) + ")");
    remove.slideUp('fast',function() { remove.remove(); });
  }
  var colours = monoColours(hash);
  var cell = '<span class="cell">' + transactionHashToA(hash)
           + '<canvas width="' + CANVAS_SIZE + '" height="' + CANVAS_SIZE
           + '"></canvas></a></span>'
  $('#transactions-inner').append(cell);
  var canvas = $('canvas:last')[0];
  drawHash(canvas, colours);
  $('.cell:last').hide();
  $('html, body').animate({scrollTop: $(document).height()}, 'slow');
  $('.cell:last').fadeIn('slow');
};


var initConnection = function (spec) {
  var err = false;
  conn = new ReconnectingWebSocket('ws://ws.blockchain.info/inv');
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
    err = e;
  };
  conn.onclose = function (e) {
    if (err) {
      console.log('Closing connection because: ' + e.toString());
      conn = null;
      err = false;
    }
  };
};

var init = function (spec) {
  initConnection(spec);
};
