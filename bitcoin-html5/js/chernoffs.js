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

var CANVAS_SIZE = 160;

var WORD_SCALE2 = 2.0 / 2147483647;
var WORD_SCALE1 = 1.0 / 2147483647;

var conn;

var scaleWord2 = function(word) {
  return (word * WORD_SCALE2) - 1.0;
};

var scaleWord1 = function(word) {
  return word * WORD_SCALE1;
};

var drawChernoff = d3.chernoff()
                   .face(function(d) { return d.f; })
                   .hair(function(d) { return d.h; })
                   .mouth(function(d) { return d.m; })
                   .nosew(function(d) { return d.nw; })
                   .noseh(function(d) { return d.nh; })
                   .eyew(function(d) { return d.ew; })
                   .eyeh(function(d) { return d.eh; })
                   .brow(function(d) { return d.b; });

var drawHash = function (hash) {
  var words = longWordValues(hash);
  var span = d3.select("#transactions-inner").append('span').attr('class', 'cell');
  var a = span.append('a').attr('href', transactionHashToUrl(hash));
  var svg = a.append("svg:svg")
            .attr("height", CANVAS_SIZE).attr("width", CANVAS_SIZE);
  var dat = [{f: scaleWord1(words[7]), h: scaleWord2(words[6]),
              m: scaleWord2(words[5]), nw: scaleWord1(words[4]),
              nh: scaleWord1(words[3]), ew: scaleWord1(words[2]),
              eh: scaleWord1(words[1]), b: scaleWord2(words[0])}];
  svg.selectAll("g.chernoff").data(dat).enter()
  .append("svg:g")
  .attr("class", "face")
  .call(drawChernoff);
};

var appendHash = function (hash) {
  //console.log(hash);
  // Don't add too many elements to the page, we don't want to hog memory
  var numCells = $('.cell').size();
  if (numCells >= TRUNCATE_BLOCKS_AT) {
    var remove = $(".cell:lt(" + (numCells - TRUNCATE_BLOCKS_TO) + ")");
    remove.slideUp('fast',function() { remove.remove(); });
  }
  drawHash(hash);
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
