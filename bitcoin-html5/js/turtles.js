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

// Rather than resize the drawing to fit the canvas, use a wrap-around canvas
// Turtle graphics often has a wrap-around mode, so this is historically OK.

// Make sure these are multiples of the number of cells in a row
var TRUNCATE_BLOCKS_AT = 1200;
var TRUNCATE_BLOCKS_TO = 600;

var CANVAS_SIZE = 180;

var ANGLE_STEP = 10;
var DISTANCE_STEP = 10;

var RAD = Math.PI / 180.0;

var conn;

var drawHash = function (canvas, bits) {
  var direction = 0;
  var x = canvas.width / 2;
  var y = canvas.height / 2;
  var ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.moveTo(x, y);
  for(var i = 0; i < bits.length; i+= 2) {
    if(bits[i]) {
      var a = direction * RAD;
      if(bits[i + 1]) {
        x += DISTANCE_STEP * Math.cos(a);
        y += DISTANCE_STEP * Math.sin(a);
      } else {
        x -= DISTANCE_STEP * Math.cos(a);
        y -= DISTANCE_STEP * Math.sin(a);
      }
      // wrap around
      if(x < 0) { ctx.lineTo(x, y); x = canvas.width; ctx.moveTo(x, y) };
      if(x > canvas.width) { ctx.lineTo(x, y); x = 0; ctx.moveTo(x, y) };
      if(y < 0) { ctx.lineTo(x, y); y = canvas.height; ctx.moveTo(x, y) };
      if(y > canvas.width) { ctx.lineTo(x, y); y = 0; ctx.moveTo(x, y) };
      ctx.lineTo(x, y);
    } else {
      if(bits[i + 1]) {
        direction += ANGLE_STEP;
      } else {
        direction -= ANGLE_STEP;
      }
    }
  }
  ctx.stroke();
};

var appendHash = function (hash) {
  //console.log(hash);
  // Don't add too many elements to the page, we don't want to hog memory
  var numCells = $('.cell').size();
  if (numCells >= TRUNCATE_BLOCKS_AT) {
    var remove = $(".cell:lt(" + (numCells - TRUNCATE_BLOCKS_TO) + ")");
    remove.slideUp('fast',function() { remove.remove(); });
  }
  var bits = bitValues(hash);
  var cell = '<span class="cell">' + transactionHashToA(hash)
           + '<canvas width="' + CANVAS_SIZE + '" height="' + CANVAS_SIZE
           + '"></canvas></a></span>'
  $('#transactions-inner').append(cell);
  var canvas = $('canvas:last')[0];
  drawHash(canvas, bits);
  $('.cell:last').hide();
  $('html, body').animate({scrollTop: $(document).height()}, 'slow');
  $('.cell:last').fadeIn('slow');
};

var initConnection = function (spec) {
  var err = false;
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
