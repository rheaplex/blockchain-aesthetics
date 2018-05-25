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

var DIV_1_255 = 1.0 / 255;
var DIV_255_8 = 255.0 / 8;
var DIV_255_4 = 255.0 / 4;
var DIV_1_16 = 1.0 / 16

// 8-8-4 256 colour RGB palette
var COLOUR_PALETTE_256 = Array();
for(var r = 0; r < 256; r += 32) {
  for(var g = 0; g < 256; g += 32) {
    for(var b = 0; b < 256; b += 64) {
      //var rgb = b | (g << 8) | (r << 16);
      //COLOUR_PALETTE_256.push('#' + rgb.toString(16));
      COLOUR_PALETTE_256.push('rgb(' + r.toString() + ', '
                              + g.toString() + ', ' +
                              + b.toString() + ')');
    }
  }
}

var COLOUR_PALETTE_CGA = [
  "#000000", "#0000AA", "#00AA00", "#00AAAA",
  "#AA0000", "#AA00AA", "#AA5500", "#AAAAAA",
  "#555555", "#5555FF", "#55FF55", "#55FFFF",
  "#55FFFF", "#FF55FF", "#FFFF55", "#FFFFFF"
];

var GEOMETRIC_SHAPES = [
  "&#11825;", // 0, dot (word separator)
  "&#9679;", // 1, circle
  "&#9644;", // 2, horizontal bar
  "&#9650;", // 3, upward-pointing triangle
  "&#9632;", // 4, square
  "&#11039;", // 5, pentagon
  "&#11042;", // 6, hexagon
  "", // 7
  "&#11204;" // 8, octagon
];

var bitValues = function(hash) {
  var values = Array();
  for (var i = 0; i < hash.length; i += 2) {
    var element = parseInt(hash.substring(i, i + 2), 16);
    values.push(element & 128 ? 1 : 0);
    values.push(element & 64 ? 1 : 0);
    values.push(element & 32 ? 1 : 0);
    values.push(element & 16 ? 1 : 0);
    values.push(element & 8 ? 1 : 0);
    values.push(element & 2 ? 1 : 0);
    values.push(element & 4 ? 1 : 0);
    values.push(element & 1 ? 1 : 0);
  }
  return values;
};

var nibbleValues = function(hash) {
  var values = Array();
  for (var i = 0; i < hash.length; i += 2) {
    var element = parseInt(hash.substring(i, i + 2), 16);
    values.push(element & 0x0F);
    values.push((element >> 4) & 0x0F);
  }
  return values;
};

var byteValues = function(hash) {
  var values = Array();
  for (var i = 0; i < hash.length; i += 2) {
    var element = parseInt(hash.substring(i, i + 2), 16);
    values.push(element);
  }
  return values;
};

var shortWordValues = function(hash) {
  var values = Array();
  for (var i = 0; i < hash.length; i += 4) {
    var element = parseInt(hash.substring(i, i + 4), 16);
    values.push(element);
  }
  return values;
};

var longWordValues = function(hash) {
  var values = Array();
  for (var i = 0; i < hash.length; i += 8) {
    var element = parseInt(hash.substring(i, i + 8), 16);
    values.push(element);
  }
  return values;
};

var monoColours = function(hash) {
  var values = bitValues(hash);
  var colours = Array();
  values.forEach(function(value){
    if(value) {
      colours.push("black");
    } else {
      colours.push("white");
    }
  });
  return colours;
};

var greyColours = function(hash) {
  var values = byteValues(hash);
  var colours = Array();
  values.forEach(function(value){
    var rgb = value | (value << 8) | (value << 16);
    //colours.push('#' + rgb.toString(16));
    colours.push('rgb(' + value.toString() + ', ' + value.toString() + ', '
                 + value.toString() + ')');
  });
  return colours;
};

var paletteColours256 = function(hash) {
  var values = byteValues(hash);
  var colours = Array();
  values.forEach(function(value){
    colours.push(COLOUR_PALETTE_256[value]);
  });
  return colours;
};

var paletteColoursCGA = function(hash) {
  var values = nibbleValues(hash);
  var colours = Array();
  values.forEach(function(value){
    colours.push(COLOUR_PALETTE_CGA[value]);
  });
  return colours;
};

var rgbColours = function(hash) {
  var values = wordValues(hash);
  var colours = Array();
  values.forEach(function(value){
    var red = (value & 0xF800) >> 11;
    var green = (value & 0x7E0) >> 5;
    var blue = (value & 0x1F);
    //var rgb = blue | (green << 8) | (red << 16);
    //colours.push('#' + rgb.toString(16));
    colours.push('rgb(' + red.toString() + ', ' + green.toString() + ', '
                 + blue.toString() + ')');
  });
  return colours;
};

var cmykColours = function(hash) {
  var colours = Array();
  for (var i = 0; i < hash.length; i += 8) {
    // In range 0..1
    var cyan = DIV_1_255 * parseInt(hash.substring(i, i + 2), 16);
    var magenta = DIV_1_255 * parseInt(hash.substring(i + 2, i + 4), 16);
    var yellow = DIV_1_255 * parseInt(hash.substring(i + 4, i + 6), 16);
    var key = DIV_1_255 * parseInt(hash.substring(i + 6, i + 8), 16);
    // In range 0..255
    var red = 255 * (1 - cyan) * (1 - key);
    var green = 255 * (1 - magenta) * (1 - key);
    var blue = 255 * (1 - yellow) * (1 - key);
    //var rgb = blue | (green << 8) | (red << 16);
    //colours.push('#' + rgb.toString(16));
    colours.push('rgb(' + red.toString() + ', ' + green.toString() + ', '
                 + blue.toString() + ')');
  }
  return colours;
};

var toDivs = function(colours, classID){
  var row = ''
  colours.forEach(function(colour){
    row += '<div class="' + classID + '" style="background-color:' + colour
         + '"></div>'
  });
  return row;
};

var toStripesTable = function(colours, width, height){
  var table = "<table width=\"" + width + "\" height=\"" + height + "\"><tr>";
  table += toStripesTableRow(colours);
  table += "</tr></table>";
  return table;
};

var toBullets = function(colours) {
  var row = '';
  colours.forEach(function(colour){
    row += "<span style=\"color:" + colour + "\">&#11044;</span>"

  });
  return row;
};

// Return normalized 4-bit co-ordinate pairs

var toCoordinates = function(hash) {
  var nibbles = nibbleValues(hash);
  var coords = [];
  for(var i = 0; i < nibbles.length; i += 2) {
    coords.push({x: nibbles[i] * DIV_1_16, y: nibbles[i + 1] * DIV_1_16});
  }
  return coords;
};

var transactionHashToUrl = function(hash) {
  return 'https://blockchain.info/tx/' + hash;
};

var blockHashToUrl = function(hash) {
  return 'https://blockchain.info/block-index/' + hash;
};

var transactionHashToA = function(hash) {
  return '<a href="' + transactionHashToUrl(hash)
       + '" target="_blank" title="' + hash + '">';
};

var blockHashToA = function(hash) {
  return '<a href="' + blockHashToUrl(hash)
       + '" target="_blank" title="' + hash + '">';
};
