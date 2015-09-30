var SATOSHIS_TO_BTC = 0.00000001;

var MINDIAMETER = 1;
var MAXDIAMETER = 10
var MINHEIGHT = 1;
var MAXHEIGHT = 10;

var DIAMETERVARIANCE = MAXDIAMETER - MINDIAMETER;
var HEIGHTVARIANCE = MAXHEIGHT - MINHEIGHT;

// This is more the balance, we don't know which output is the change

var transaction_amount = function(tx) {
  var amount = 0;
  for (var out in tx["out"]) {
    amount += out["value"];
  }
  return amount * SATOSHIS_TO_BTC;
};

// Scale the transaction amount to a height

var transaction_amount_height = function(tx) {
  return MINHEIGHT + (transaction_amount(tx) * HEIGHTVARIANCE);
};

// Scale a transaction hash byte to a distance

var byteToDiameter = function(element) {
  return MINDIAMETER + (element * DIAMETERVARIANCE);
}

// At height, at radius around point, add min/max dist

var points_for_hash = function(hash, height) {
  var values = byteValues(hash);
  var numValues = values.length;
  var rotationStep = 360.0 / (numValues + 1);
  var points = [];
  for (var i = 0; i < numValues; i++) {
    var rotated = Vec3D(byteToDiameter(values[i]), height, 0);
    rotated.rotateY(i * rotationStep);
    points.append(rotated);
  }
  return points;
};

// Get a list of lists of points representing hashes as stars

var block_to_star = function(transactions) {
  return transaction_hashes.forEach(function(tx) {
           points_for_hash(tx["hash"],
                           transaction_amount_height(tx));
         });
};

// Convert the rows of points to a mesh

var triangulate_quads = function(quads) {
  var mesh = new Mesh3D();
  var prevrow = quads[quads.length - 1];
  for (var row in quads) {
    for(var i = 0; i < row.length; i++) {
      var previ = (i - 1) % row.length;
      // Two anticlockwise triangles for each quad
      mesh.addFace(prevrow[i], prevrow[previ], row[previ]);
      mesh.addFace(prevrow[previ], row[previ], row[i]);
    }
  }
  return mesh;
};