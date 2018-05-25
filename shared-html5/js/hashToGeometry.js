/**
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2015  Rhea Myers
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

// A Torus with the vertices in radial segment order
// This means we can use our vertex colouring logic unaltered
// Modified from https://github.com/mrdoob/three.js/blob/master/src/extras/geometries/TorusGeometry.js

var ReorderedVertexTorusGeometry = function ( radius, tube, radialSegments,
 tubularSegments, arc ) {

	THREE.Geometry.call( this );

	this.type = 'ReorderedVertexTorusGeometry';

	this.parameters = {
		radius: radius,
		tube: tube,
		radialSegments: radialSegments,
		tubularSegments: tubularSegments,
		arc: arc
	};

	radius = radius || 100;
	tube = tube || 40;
	radialSegments = radialSegments || 8;
	tubularSegments = tubularSegments || 6;
	arc = arc || Math.PI * 2;

	var center = new THREE.Vector3(), uvs = [], normals = [];

    for ( var i = 0; i <= tubularSegments; i ++ ) {

    	for ( var j = 0; j <= radialSegments; j ++ ) {

			var u = i / tubularSegments * arc;
			var v = j / radialSegments * Math.PI * 2;

			center.x = radius * Math.cos( u );
			center.y = radius * Math.sin( u );

			var vertex = new THREE.Vector3();
			vertex.x = ( radius + tube * Math.cos( v ) ) * Math.cos( u );
			vertex.y = ( radius + tube * Math.cos( v ) ) * Math.sin( u );
			vertex.z = tube * Math.sin( v );

			this.vertices.push( vertex );

			uvs.push( new THREE.Vector2( i / tubularSegments, j / radialSegments ) );
			normals.push( vertex.clone().sub( center ).normalize() );

		}

	}

    for ( var i = 1; i <= tubularSegments; i ++ ) {

	    for ( var j = 1; j <= radialSegments; j ++ ) {

			var d = ( radialSegments + 1 ) * i + j - 1;
			var c = ( radialSegments + 1 ) * ( i - 1 ) + j - 1;
			var b = ( radialSegments + 1 ) * ( i - 1 ) + j;
			var a = ( radialSegments + 1 ) * i + j;

			var face = new THREE.Face3( a, b, d, [ normals[ a ].clone(), normals[ b ].clone(), normals[ d ].clone() ] );
			this.faces.push( face );
			this.faceVertexUvs[ 0 ].push( [ uvs[ a ].clone(), uvs[ b ].clone(), uvs[ d ].clone() ] );

			face = new THREE.Face3( b, c, d, [ normals[ b ].clone(), normals[ c ].clone(), normals[ d ].clone() ] );
			this.faces.push( face );
			this.faceVertexUvs[ 0 ].push( [ uvs[ b ].clone(), uvs[ c ].clone(), uvs[ d ].clone() ] );

		}

	}

	this.computeFaceNormals();

};

ReorderedVertexTorusGeometry.prototype =
  Object.create( THREE.Geometry.prototype );
ReorderedVertexTorusGeometry.prototype.constructor =
  ReorderedVertexTorusGeometry;
ReorderedVertexTorusGeometry.prototype.clone = function () {

	var geometry = new ReorderedVertexTorusGeometry(
		this.parameters.radius,
		this.parameters.tube,
		this.parameters.radialSegments,
		this.parameters.tubularSegments,
		this.parameters.arc
	);

	return geometry;

};

////////////////////////////////////////////////////////////////////////////////
// Colouring
////////////////////////////////////////////////////////////////////////////////

var colourRange = function (from, to, steps) {
  if (typeof steps === 'undefined') steps = 16;
  var step = 1 / (steps - 1);
  var colours = [];
  for (var i = 0; i < steps; i++) {
    var colour = new THREE.Color(from);
    colour.lerp(to, i * step);
    colours.push(colour);
  }
  return colours;
};

// Windows default 16-colour palette;
var colours_w16 = [0x000000, 0x808080, 0x800000, 0xFF0000, 0x008000,
                   0x00FF00, 0x808000, 0xFFFF00, 0x000080, 0x0000FF,
                   0x800080, 0xFF00FF, 0x008080, 0x00FFFF, 0xC0C0C0,
                   0xFFFFFF].map(function(c) {return new THREE.Color(c); });

var black_white_palette = colourRange(new THREE.Color(0x000000),
                                      new THREE.Color(0xFFFFFF));

var black_blue_palette = colourRange(new THREE.Color(0x00000),
                                     new THREE.Color(0x0000FF));

var black_red_palette = colourRange(new THREE.Color(0x00000),
                                    new THREE.Color(0xFF0000));

var black_green_palette = colourRange(new THREE.Color(0x00000),
                                      new THREE.Color(0x00FF00));

var blue_white_palette = colourRange(new THREE.Color(0x0000FF),
                                     new THREE.Color(0xFFFFFF));

var red_white_palette = colourRange(new THREE.Color(0xFF0000),
                                    new THREE.Color(0xFFFFFF));

var green_white_palette = colourRange(new THREE.Color(0x00FF00),
                                      new THREE.Color(0xFFFFFF));

var blue_red_palette = colourRange(new THREE.Color(0x0000FF),
                                   new THREE.Color(0xFF0000));

var blue_green_palette = colourRange(new THREE.Color(0x0000FF),
                                     new THREE.Color(0x00FF00));

var red_green_palette = colourRange(new THREE.Color(0xFF0000),
                                    new THREE.Color(0x00FF00));

var colour_palettes = {
    'Windows 16': colours_w16,
    'Black/White': black_white_palette,
    'Black/Blue': black_blue_palette,
    'Black/Red': black_red_palette,
    'Black/Green': black_green_palette,
    'Blue/White': blue_white_palette,
    'Red/White': red_white_palette,
    'Green/White': green_white_palette,
    'Blue/Red': blue_red_palette,
    'Blue/Green': blue_green_palette,
    'Red/Green': red_green_palette
};

var colour_palette_names = Object.keys(colour_palettes);

var hashStringColour = function(hash, colours, index) {
  var i = parseInt(hash[index], 16);
  return new THREE.Color(colours[i]);
};

var offsetIndex = function (index, start, hashstride, loopAfter) {
  var row_stride = hashstride + 1;
  var i = (index - start) % loopAfter;
  var vertex_rows = Math.floor(i / row_stride);
  var result;
  if ((i > 0 ) && ((i % row_stride) == hashstride)) {
    result = (i - vertex_rows) - row_stride + 1;
  } else {
    result = i - vertex_rows;
  }
  return result;
};

var hashStringColourVertices = function(geometry, hashstring, colours,
                                       start, end, stride, loopAfter,
                                       otherwise) {
  geometry.faces.forEach(function(face) {
    if ((face.a >= start) && (face.a < end)) {
      var a = offsetIndex(face.a, start, stride, loopAfter);
      face.vertexColors[0] =
        hashStringColour(hashstring, colours, a);
    } else {
      face.vertexColors[0] = otherwise;
    }
    if ((face.b >= start) && (face.b < end)) {
      var b = offsetIndex(face.b, start, stride, loopAfter);
      face.vertexColors[1] =
        hashStringColour(hashstring, colours, b);
    } else {
      face.vertexColors[1] = otherwise;
    }
    if ((face.c >= start) && (face.c < end)) {
      var c = offsetIndex(face.c, start, stride, loopAfter);
      face.vertexColors[2] =
        hashStringColour(hashstring, colours, c);
    } else {
      face.vertexColors[2] = otherwise;
    }
  });
};

////////////////////////////////////////////////////////////////////////////////
// Geometry distortion
////////////////////////////////////////////////////////////////////////////////

var geometryRowsDistortSphere = function (geometry, step, hashstring,
                                          columns, hash_stride, initial_skip) {
  var centre = geometry.center();
  // Map the hash values onto the sphere vertices (excluding poles)
  for (var y = 0; y < hash_stride; y++) {
    var row_offset = (y + initial_skip) * columns;
    for (var x = 0; x < hash_stride; x++) {
      var hashstring_index = (y * hash_stride) + x;
      var value = parseInt(hashstring[hashstring_index], 16);
      var vertex_index = row_offset + x;
      var vertex = geometry.vertices[vertex_index];
      var offset = new THREE.Vector3();
      offset.copy(vertex);
      offset.sub(centre);
      offset.normalize();
      offset.multiplyScalar(step * value);
      geometry.vertices[vertex_index].add(offset);
    }
    // Close gap between first and last vertex of each ring
    geometry.vertices[row_offset
                      + columns - 1].copy(geometry.vertices[row_offset]);
  }
};

var geometryRowsDistortCylinder = function (geometry, step, hashstring,
                                            face_columns, hash_stride,
                                            initial_skip) {
  var centre = geometry.center();
  var vertex_columns = face_columns + 1;
  // Map the hash values onto the sphere vertices (excluding poles)
  for (var y = 0; y < hash_stride; y++) {
    var row_offset = (y + initial_skip) * vertex_columns;
    for (var x = 0; x < hash_stride; x++) {
      var hashstring_index = (y * hash_stride) + x;
      var value = parseInt(hashstring[hashstring_index], 16);
      var vertex_index = row_offset + x;
      var vertex = geometry.vertices[vertex_index];
      var offset = new THREE.Vector3();
      // Centre of the cylinder at the same level as the vertex
      centre.y = vertex.y;
      offset.copy(vertex);
      offset.sub(centre);
      offset.normalize();
      offset.multiplyScalar(step * value);
      geometry.vertices[vertex_index].add(offset);
    }
    // Close gap between first and last vertex of each ring
    geometry.vertices[row_offset + face_columns] =
      geometry.vertices[row_offset];
  }
  geometry.verticesNeedUpdate = true;
};

var geometryRowsDistortTorus = function (geometry, step, hashstring,
                                         face_columns, hash_stride) {
  var rotation_axis = new THREE.Vector3(0, 0, 1);
  var vertex_columns = face_columns + 1;
  var rotation_step = (Math.PI * 2) / face_columns;
  for (var y = 0; y < face_columns; y++) {
    var row_offset = (y * vertex_columns);
    for (var x = 0; x < (hash_stride + 1); x++) {
      var centre = geometry.center();
      centre.x += geometry.parameters.radius;
      centre.applyAxisAngle(rotation_axis, rotation_step * y);
      var hashstring_index = (y * hash_stride) + x;
      var value = parseInt(hashstring[hashstring_index], 16);
      var vertex_index = row_offset + x;
      var vertex = geometry.vertices[vertex_index];
      var offset = new THREE.Vector3();
      // Centre of the cylinder at the same level as the vertex
      offset.copy(vertex);
      offset.sub(centre);
      offset.normalize();
      offset.multiplyScalar(step * value);
      geometry.vertices[vertex_index].add(offset);
    }
    // Close gap between first and last vertex of each ring
    geometry.vertices[row_offset + hash_stride] =
      geometry.vertices[row_offset];
  }
  // We have one extra vertex "row" to join back to the first
  var offset = face_columns * (hash_stride + 1);
  for (var x = 0; x <= hash_stride; x++) {
    geometry.vertices[x + offset] =
      geometry.vertices[x];
  }
};

////////////////////////////////////////////////////////////////////////////////
// hexString64ToSphere
////////////////////////////////////////////////////////////////////////////////

var SPHERE_COLUMNS_FACE_COUNT = 8;
var SPHERE_COLUMNS_VERTEX_COUNT = SPHERE_COLUMNS_FACE_COUNT + 1;
var SPHERE_ROWS_FACE_COUNT = 9;
var SPHERE_ROWS_VERTEX_COUNT = SPHERE_COLUMNS_FACE_COUNT + 1;
var SPHERE_ROWS_INITIAL_SKIP = 1;

var HEX_STRING_64_STRIDE = 8;

var hexString64ToSphere = function (diameter, step, hashstring) {
  var geometry = new THREE.SphereGeometry(diameter / 2,
                                          SPHERE_COLUMNS_FACE_COUNT,
                                          SPHERE_ROWS_FACE_COUNT);
  geometryRowsDistortSphere(geometry, step, hashstring,
                            SPHERE_COLUMNS_VERTEX_COUNT, HEX_STRING_64_STRIDE,
                            SPHERE_ROWS_INITIAL_SKIP);
  return geometry;
};

////////////////////////////////////////////////////////////////////////////////
// hexStringToCyliner
////////////////////////////////////////////////////////////////////////////////

var CYLINDER_ROWS = 7;
var CYLINDER_COLUMNS = 8;
var CYLINDER_INITIAL_SKIP = 0;

var hexString64ToCylinder = function (diameter, height, step, hashstring) {
  var geometry = new THREE.CylinderGeometry(diameter / 2, diameter / 2, height,
                                            CYLINDER_COLUMNS,
                                            CYLINDER_ROWS);
  geometryRowsDistortCylinder(geometry, step, hashstring, CYLINDER_COLUMNS,
                              HEX_STRING_64_STRIDE, CYLINDER_INITIAL_SKIP);
  return geometry;
};

////////////////////////////////////////////////////////////////////////////////
// hexStringToTorus
////////////////////////////////////////////////////////////////////////////////

var TORUS_ROWS = 8;
var TORUS_COLUMNS = 8;

var hexString64ToTorus = function (diameter, width, step, hashstring) {
  var geometry = new ReorderedVertexTorusGeometry(diameter / 2, width,
                                                  TORUS_COLUMNS, TORUS_ROWS);
  geometryRowsDistortTorus(geometry, step, hashstring, TORUS_COLUMNS,
                           HEX_STRING_64_STRIDE);
  return geometry;
};

////////////////////////////////////////////////////////////////////////////////
// hexStringToPlaneHeights
////////////////////////////////////////////////////////////////////////////////

var hexString64ToPlaneHeights = function (width, step, hashstring) {
  var STRIDE = 8;
  var CELL_SIZE = width / STRIDE;
  var Y_SCALE = step / 15;

  var geometry = new THREE.PlaneGeometry(width, width, STRIDE - 1, STRIDE - 1);

  hashstring.split('').forEach(function(c, index) {
    geometry.vertices[index].z = parseInt(c, 16) * Y_SCALE;
  });

  // Rotate so geometry lies flat
  //var matrix = new THREE.Matrix4().makeRotationX(Math.PI * 1.5);
  //geometry.applyMatrix(matrix);

  return geometry;
};

////////////////////////////////////////////////////////////////////////////////
// UI And events
////////////////////////////////////////////////////////////////////////////////

var _gui = new dat.GUI();
_gui.closed = true;

var addGuiOption = function (obj, label, value, callback) {
  var controller = _gui.add(obj, label, value).onFinishChange(callback);
  if (typeof callback != 'undefined') {
    controller.onFinishChange(callback);
  }
};

var state = new Object();
state.hash = 'a71ece5364eaca8e21831fed14e622d749a0ee072ba6c8182b7ca8b81e5a4ce2';
state.live = true;
state.roll = true;
state.palette = 'Windows 16';
state.shape = 'sphere';
state.range = 1;
state.background = 0x444444;
state.currentModel = false;

state.regenerateModel = function () {
  if (this.currentModel) {
  _scene_contents_wrapper.remove(this.currentModel.mesh);
  this.currentModel.modelFromState(this);
  _scene_contents_wrapper.add(this.currentModel.mesh);
  }
};

var HashMesh = function (state) {
  this.hash = state.hash;
  this.modelFromState(state);
};

HashMesh.prototype.material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  shading: THREE.FlatShading,
  vertexColors: THREE.VertexColors//,
  //side: THREE.DoubleSide
});

HashMesh.prototype.modelFromState = function (state) {
  this.material.side = THREE.FrontSide;
  switch (state.shape) {
    case "plane":
      this.material.side = THREE.DoubleSide;
      this.geometry = hexString64ToPlaneHeights(40, state.range * 10,
                                                this.hash);
      hashStringColourVertices(this.geometry, this.hash,
                               colour_palettes[state.palette],
                               0, this.geometry.vertices.length,
                               8, 100000000000000,
                               new THREE.Color(0xffffff));
      break;
    case "cylinder":
      this.geometry = hexString64ToCylinder(16, 35, state.range, state.hash);
      hashStringColourVertices(this.geometry, this.hash,
                               colour_palettes[state.palette],
                               0, this.geometry.vertices.length - 2,
                               8, 100000000000000,
                               new THREE.Color(0xffffff));
      break;
    case "sphere":
      this.geometry = hexString64ToSphere(20, state.range, this.hash);
      hashStringColourVertices(this.geometry, this.hash,
                               colour_palettes[state.palette],
                               9, this.geometry.vertices.length - 9,
                               8, 100000000000,
                               new THREE.Color(0xffffff));
      break;
    case "torus":
      this.geometry = hexString64ToTorus(40, 2.0, state.range * 0.75,
                                         this.hash);
      hashStringColourVertices(this.geometry, this.hash,
                               colour_palettes[state.palette],
                               0, this.geometry.vertices.length,
                               8, 9 * 8,
                               new THREE.Color(0xff0000));
      break;
  }
  this.mesh = new THREE.Mesh( this.geometry, this.material );
  this.mesh._hashmesh = this;
};

HashMesh.prototype.tweenIn = function (duration) {
  this.mesh.scale.set(0.001, 0.001, 0.001);
  _scene_contents_wrapper.add(this.mesh);
  var self = this;
  this.tween = new TWEEN.Tween({ scale: 0.001, direction:'in' })
               .to({ scale: 1 }, duration)
               .onUpdate( function () {
                 self.mesh.scale.set(this.scale, this.scale, this.scale);
               })
               .onComplete(function () {
                 TWEEN.remove(this);
                 delete self.tween;
               })
               .start();
};

HashMesh.prototype.tweenOut = function (duration) {
  if (this.tween && this.tween.direction == 'in') {
    this.tween.stop();
    TWEEN.remove(this.tween);
    delete this.tween;
  }
  var self = this;
  this.tween = new TWEEN.Tween({ scale: self.mesh.scale.x, direction:'out' })
               .to({ scale: 0.001 }, duration)
               .onUpdate( function () {
                 self.mesh.scale.set(this.scale, this.scale, this.scale);
               })
               .onComplete(function () {
                 //_scene.remove(self.mesh);
                 _scene_contents_wrapper.remove(self.mesh);
                 //self.mesh.parent.remove(self.mesh)
                 TWEEN.remove(this);
               })
               .start();
};

state['Save STL'] = function (){
  var exporter = new THREE.STLExporter();
  var stl = exporter.parse(this.currentModel);
  var blob = new Blob([stl], {type: "application/sla;charset=utf-8"});
  saveAs(blob, this.hash + '.stl');
};

state['Save OBJ'] = function (){
  var exporter = new THREE.OBJExporter();
  var obj = exporter.parse(this.currentModel);
  var blob = new Blob([obj], {type: "text/plain;charset=utf-8"});
  saveAs(blob, state.hashstring + '.obj');
};

var updateFollowLiveBlockchain = function (start) {
  if (start) {
    $.get('https://blockchain.info/q/latesthash',
          function(data) {
            updateHash(data);
          });
    // There's a race with the ajax here but we don't care
    initConnection(state.spec);
  } else {
    conn.close(1000);
    conn = null;
    console.log('closed');
  }
};

var _duration = 1000;

var updateHash = function (hash) {
  state.hash = hash;
  _scene_contents_wrapper.children.forEach(function (mesh) {
    mesh._hashmesh.tweenOut(_duration);
    //_scene_contents_wrapper.remove(mesh);
  });
  state.currentModel = new HashMesh(state);
  state.currentModel.tweenIn(_duration);
};

var startStopRolling = function () {
  if (state.roll) {
    setRoll(new THREE.Vector3(-0.005, -0.01, 0));
  } else {
    setRoll(new THREE.Vector3(0, 0, 0));
  }
};

var changeBackgroundColour = function () {
  _renderer.setClearColor(state.background);
};

var addBitcoinOptions = function () {
  _gui.add(state, 'hash')
    .onFinishChange(function() { state.regenerateModel(); }).listen();
  _gui.add(state, 'live', state.live)
    .onFinishChange(updateFollowLiveBlockchain).listen();;
  _gui.add(state, 'roll')
    .onFinishChange(startStopRolling);
  _gui.add(state, 'palette', colour_palette_names)
    .onFinishChange(function() { state.regenerateModel(); });
  _gui.add(state, 'shape', ['plane', 'sphere', 'cylinder', 'torus'])
    .onFinishChange(function() { state.regenerateModel(); });
  _gui.add(state, 'range')
    .onFinishChange(function() { state.regenerateModel(); });
  _gui.addColor(state, 'background')
    .onChange(changeBackgroundColour);
  _gui.add(state, 'Save STL')
    .onFinishChange(function() { state.regenerateModel(); });
  _gui.add(state, 'Save OBJ')
    .onFinishChange(function() { state.regenerateModel(); });
};

var conn;

var initConnection = function (spec) {
  conn = new ReconnectingWebSocket('wss://ws.blockchain.info/inv');
  conn.onopen = function () {
    // Should assert conn and err
    conn.send(spec);
  };
  conn.onmessage = function (e) {
    var data = $.parseJSON(e.data);
    var hash = data.x.hash;
    updateHash(hash);
  };
  conn.onerror = function (e) {
    console.log(e);
  };
};

// Only show the UI when the mouse moves
var _hider = null;
var _mousemove = function() {
  clearTimeout(_hider);
  $(_gui.domElement).show();
  _hider = setTimeout(function() {
             $(_gui.domElement).hide();
             _gui.closed = true;
           }, 5000);
};

var init = function (spec, initial, duration) {
  _duration = duration;
  setViewDistance(45);
  addBitcoinOptions()
  state.spec = spec;
  startStopRolling();
  changeBackgroundColour(state.background);
  if (! state.live) {
    updateHash(initial);
  }
  updateFollowLiveBlockchain(state.live)

  $(_gui.domElement).hide();
  $('body').mousemove(_mousemove);
};

// @license-end
