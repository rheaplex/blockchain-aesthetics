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
var TRUNCATE_BLOCKS_AT = 20;
var TRUNCATE_BLOCKS_TO = 16;

var CANVAS_SIZE = 256;

var conn;

var addBoard = function(hash) {
  var cell = '<span class="cell">' + transactionHashToA(hash)
           + '<canvas width="' + CANVAS_SIZE + '" height="' + CANVAS_SIZE
           + '"></canvas></a></span>'
  $('#transactions-inner').append(cell);
  var canvas = $('canvas:last')[0];
  var board = new Board(canvas, hash);
};

var appendHash = function (hash) {
  // Don't add too many elements to the page, we don't want to hog memory
  var numCells = $('.cell').size();
  if (numCells >= TRUNCATE_BLOCKS_AT) {
    var remove = $(".cell:lt(" + (numCells - TRUNCATE_BLOCKS_TO) + ")");
    remove.slideUp('fast',function() { remove.remove(); });
  }
  addBoard(hash);
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
  animationLoop();
};
