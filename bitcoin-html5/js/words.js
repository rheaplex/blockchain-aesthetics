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

var conn;

function capitaliseFirstLetter(string)
{
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var appendHash = function (hash) {
  //console.log(hash);
  var hash_html = '<p class="row">' + transactionHashToA(hash)
                + capitaliseFirstLetter(mn_encode(hash)) + '.</a></p>';
  $('#transactions').append(hash_html);

  $('.row:last').hide();
  // Scroll to show the new row
  $("html, body").animate({ scrollTop: $(document).height() }, 'slow');
  $('.row:last').fadeIn('slow');
  // Keep rows to 1000 or whatever
  if ($('.row').size() >= TRUNCATE_ROWS_AT) {
    var remove = $(".row:lt(" + TRUNCATE_ROWS_TO + ")");
    remove.slideUp('fast',function() { remove.remove(); });
  }
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
