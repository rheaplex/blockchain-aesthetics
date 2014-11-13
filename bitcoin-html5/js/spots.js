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

var TRUNCATE_ROWS_AT = 1200;
var TRUNCATE_ROWS_TO = 600;

var appendHash = function (hash) {
  //console.log(hash);
  var colours = paletteColours256(hash);
  var hash_html = '<div class="row">' +transactionHashToA(hash)
                + toBullets(colours) + '</a></div>';
  //var hash_html = $('<p>' + hash + '</p>');
  $('#transactions').prepend(hash_html);
  var row = $('.row:first');
  row.hide();
  //row.slideDown();
  row.fadeIn();
  // Keep rows to 1000 or whatever
  if ($('.row').size() >= TRUNCATE_ROWS_AT) {
    var remove = $(".row:gt(" + TRUNCATE_ROWS_TO + ")");
    remove.slideUp('fast',function() { remove.remove(); });
  }
};

var initConnection = function (spec) {
  var conn = new ReconnectingWebSocket('ws://ws.blockchain.info/inv');
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

var init = function (spec) {
  initConnection(spec);
};
