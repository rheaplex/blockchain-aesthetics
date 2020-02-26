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

const paletteColours = crystalPaletteColours;

let weHaveEthereumAccess = false;

const strip0x = src => src.startsWith('0x') ? src.substring(2) : src;

const initEthereum = () => {
  // Modern dapp browsers...
  if (window.ethereum) {
    window.web3 = new Web3(ethereum);
    weHaveEthereumAccess = true;
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider);
    weHaveEthereumAccess = true;
  }
  // Non-dapp browsers...
  else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    document.write("No Ethereum access detected. Try installing an Ethereum plugin, using an Ethereum-enabled browser, or (if you have) updating this project's source code.");
  }
};

const initBlocks = () => {
  window.addEventListener('load', () => {
    initEthereum();
    web3.eth.subscribe('newBlockHeaders', (error, result) => {
      if (! error) {
        appendHash(strip0x(result.hash));
      } else {
        console.log(error);
      }
    });
  });
};

// We can't access raw broadcast transactions, so unpack each block as it
// comes in.

// Current block time is ~ 15 seconds, so delay txes a little.

const ethTxQueue = [];

const appendTx = () => {
  if(ethTxQueue.length > 0) {
    appendHash(ethTxQueue.pop());
  }
  // Either aim for 15 seconds, or check again in one second
  const delay = 15000 / ethTxQueue.length ? ethTxQueue.length : 15;
  setTimeout(appendTx, delay);
};

const initTransactions = () => {
  window.addEventListener('load', () => {
    initEthereum();
    web3.eth.subscribe('newBlockHeaders', async (error, result) => {
      if (! error) {
        const block = await web3.eth.getBlock(result.hash);
        block.transactions.forEach(tx => ethTxQueue.push(strip0x(tx)));
      }
    });
    appendTx();
  });
};
