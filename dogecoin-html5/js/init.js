/**
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2018 Rhea Myers
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

const paletteColours = wowPaletteColours

Pusher.host = 'slanger1.chain.so'
Pusher.ws_port = 443
Pusher.wss_port = 443

const _initDogecoinConnection = (messageType, extract) => {
  const pusher = new Pusher('e9f5cc20074501ca7395',
                            { encrypted: true,
                              disabledTransports: ['sockjs'],
                              disableStats: true })

  const ticker = pusher.subscribe('blockchain_update_doge')
  
  ticker.bind(messageType + '_update', data => {
    if (data.type == messageType) {
      appendHash(extract(data))
    }
  })

}

const initBlocks = () => {
  _initDogecoinConnection('block', data => data.value.blockhash)
}

const initTransactions = function () {
  _initDogecoinConnection('tx', data => data.value.txid)
}
