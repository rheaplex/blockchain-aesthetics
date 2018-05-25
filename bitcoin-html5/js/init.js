/**
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2014,2018 Rhea Myers
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

var initBlocks = function () {
  initConnection('{"op":"blocks_sub"}');
};

var initTransactions = function () {
  initConnection('{"op":"unconfirmed_sub"}');
};
