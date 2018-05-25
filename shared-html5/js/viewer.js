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

// Calculate the distance at which the object bounding sphere
// Fits comfortably in the camera frustum

var _scene = new THREE.Scene();
var _aspect_ratio = window.innerWidth / window.innerHeight;
var _camera = new THREE.PerspectiveCamera(75, _aspect_ratio, 0.1,
                                         1000);

var _renderer = new THREE.WebGLRenderer();
_renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(_renderer.domElement);

var _light = new THREE.PointLight(0xffffff);
_camera.add(_light);
// Need to do this if the camera has any children
_scene.add(_camera);

var controls = new THREE.OrbitControls(_camera, _renderer.domElement);

window.addEventListener('resize', function() {
  var WIDTH = window.innerWidth;
  var HEIGHT = window.innerHeight;
  _renderer.setSize(WIDTH, HEIGHT);
  _camera.aspect = WIDTH / HEIGHT;
  _camera.updateProjectionMatrix();
});

var _roll = new THREE.Vector3(0, 0, 0);
var _scene_contents_wrapper = new THREE.Group();
_scene.add(_scene_contents_wrapper);

var setRoll = function (roll) {
  _roll = roll;
};

var render = function (time) {
  requestAnimationFrame(render);
  TWEEN.update(time);
  _renderer.render(_scene, _camera);
  _scene_contents_wrapper.rotateX(_roll.x);
  _scene_contents_wrapper.rotateY(_roll.y);
  _scene_contents_wrapper.rotateZ(_roll.z);
  controls.update();
}

var setViewDistance = function (distance) {
  _camera.position.z = - distance;
}

// @license-end
