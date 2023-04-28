import * as THREE from 'three';
import { OrbitControls } from './build/OrbitControls.js';
import { UnrealBloomPass } from './build/UnrealBloomPass.js';
import { EffectComposer } from './build/EffectComposer.js';
import { RenderPass } from './build/RenderPass.js';
import { GUI } from './build/dat.gui.module.js';

//==================================
//=======Snowflake Fractal==========
//==================================

var geometry, material, mesh;

//defaults
//it is advised that branches and depth should share the value
//that is done because it breaks the geometry and it outputs a vector mess

let branchAndDepth = THREE.MathUtils.randInt(3, 6);
var branches = branchAndDepth, 
    depth = branchAndDepth,    
    offsetAngle = THREE.MathUtils.randInt(20, 90);
    length = window.innerHeight / 120;

//parameters for GUI
let params = {
  branches: branches,
  depth: depth,
  offsetAngle: offsetAngle,
  length: length
}

const scene = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

let snowflakeVertices = []; //this one should be outside function so all functions know about this geometry array

function createSnowflake(){
 
  for (var i = 0; i < branches; i++) {
    material = new THREE.LineBasicMaterial();
    material.color = new THREE.Color('skyblue');

    const angle = 360 * i / branches;
    //THREE.Geometry() used to accept vertices.push() which you could directly push to geometry
    //THREE.BufferGeometry() has no vertices property so we need to init an array of vertices instead
    //Then the important part is that you use setFromPoints() and pass in the array of vertices to geometry

    let originPosition = new THREE.Vector3(0, 0, 0);
    snowflakeVertices.push(originPosition);

    let expandingPosition = new THREE.Vector3(
      Math.cos(angle * Math.PI / 180) * length,
      Math.sin(angle * Math.PI / 180) * length, 
      0)

    snowflakeVertices.push(expandingPosition); 

    makeFractalLine(expandingPosition, 5, angle);  
  }
}


function makeFractalLine(position, depth, angle) {
  if (depth < 1)
      return null;

  let startAngle = -(2 - 1) * offsetAngle / 2 + angle*1;

  for (var i = 0; i < 2; i++) {

    snowflakeVertices.push(position)
    angle += offsetAngle;

    let newPosition = new THREE.Vector3(
      Math.cos(angle * Math.PI / 180) * length + position.x,
      Math.sin(angle * Math.PI / 180) * length + position.y, 
      0);

    snowflakeVertices.push(newPosition)
    
    //function iteration 
    makeFractalLine(newPosition, depth-1, startAngle);
    startAngle += offsetAngle;
    
    //Once the geometry has been rendered, the morph attribute data cannot be changed.
    //This proves the 'Shape' sliders obsolete unfortunately.
    //I miss legacy Geometry class...
    geometry = new THREE.BufferGeometry().setFromPoints(snowflakeVertices);
    mesh = new THREE.Line(geometry, material);

    animate();

  }
}

//RENDER EFFECTS
//make webGL to render alpha channel to have background color defined in .css
var renderParams = { alpha: true, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: true };
var renderer = new THREE.WebGLRenderer(renderParams);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Controls and effects
const controls = new OrbitControls(camera, renderer.domElement);

const renderPass = new RenderPass(scene, camera);
const emission = new UnrealBloomPass(1, 1, 1, 0);

//Effect composer
const composer = new EffectComposer(renderer);

composer.addPass(renderPass); //renderpass needs to be first
//composer.addPass(emission);



//Basic Cube for debugging scene
function debugCube()
{  
    //create the material of the cube (basic material)
    var materialCube = new THREE.MeshBasicMaterial();
    //set the color of the cube
    materialCube.color=  new THREE.Color('skyblue');
    //then set the renderer to wireframe
    materialCube.wireframe=true;
    //create the mesh of a cube
    var geometryCube = new THREE.BoxGeometry(3,3,3);
    var cube = new THREE.Mesh(geometryCube, materialCube);

    scene.add(cube);
}  
   
function renderGui()
{
  const gui = new GUI();

  let rotationFolder = gui.addFolder("Rotation");
  rotationFolder.add(mesh.rotation,"x", 0, Math.PI * 2, 0.001).name("X-Rotation");
  rotationFolder.add(mesh.rotation, "y", 0, Math.PI * 2, 0.001).name("Y-Rotation");
  rotationFolder.add(mesh.rotation, "z", 0, Math.PI * 2, 0.001).name("Z-Rotation");

  //this parameters are obsolete since BufferGeometry Could not be changed
  //let shapeFolder = gui.addFolder("Shape");
  //shapeFolder.add(params, "branches", 0, 10, 1).name("Branches");
  //shapeFolder.add(params, "offsetAngle", 0, 45, 1).name("Angle");
  //shapeFolder.add(params, "depth", 0, 10, 1).name("Depth");

  console.log("Branches: " + params.branches);
  console.log("Branch Angle: " + params.depth);
  console.log("Depth: " + params.depth);
  console.log("Length: " + params.length);
  
}

function animate(){
    requestAnimationFrame(animate);

    //it's very important to clear the scene!
    //otherwise it has poor performance and pollutes the output with geometry 

    scene.clear();
    scene.add(mesh);

    //this flag needs to be set to be able to update geometry after first render
    mesh.geometry.attributes.position.needsUpdate = true;

    let increment = 0.000005;
    mesh.rotation.x += increment;
    mesh.rotation.y += increment;
    mesh.rotation.z += increment;

    controls.update();
    composer.render(renderPass, camera);
}

function generateInstance(){
  createSnowflake();
  renderGui();
}

generateInstance();

    


