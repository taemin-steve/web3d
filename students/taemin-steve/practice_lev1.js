import * as THREE from "./js/three.module.js";
import { OrbitControls } from "./js/OrbitControls.js";
import { GUI } from './js/dat.gui.module.js';

// https://threejsfundamentals.org/threejs/lessons/kr/threejs-fundamentals.html
const render_w = window.innerWidth;
const render_h = window.innerHeight;
/// 랜더러의 화면 크기 설정

console.log(render_w, render_h);
console.log("aspectRatio: " + render_w/render_h);
console.log("devicePixelRatio: " + window.devicePixelRatio);


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, render_w/render_h, 0.1, 100);
const renderer = new THREE.WebGLRenderer();
//const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(render_w, render_h);
/// 기본적인 화면 설정

//const controls = new OrbitControls(camera, renderer.domElement);


const geomery = new THREE.BoxGeometry(1, 1, 1);
const texture = new THREE.TextureLoader().load( './teximg.jpg' );
const material = new THREE.MeshPhongMaterial( {color:0xFFFFFF, map:texture} );
const cube = new THREE.Mesh(geomery, material);
cube.matrixAutoUpdate = false;
/// 박스 만들기


const light = new THREE.DirectionalLight(0xFFFFFF, 1);
let light_helper;
let mode_movement = "none";
///광원

dom_init();
scene_init();
SetOrbitControls(true);

function dom_init() {
    const container = document.getElementById('render_div');
    container.appendChild(renderer.domElement);
    container.addEventListener("mousedown", mouseDownHandler, false);
    container.addEventListener("mousemove", mouseMoveHandler, false);
    container.addEventListener("wheel", mouseWheel, false);
    container.addEventListener('contextmenu', function (e) { 
        e.preventDefault(); 
    }, false);

    window.addEventListener( 'resize', onWindowResize );

    function onWindowResize() {

        render_w = window.innerWidth;
        render_h = window.innerHeight;
        camera.aspect = render_w/render_h;
        camera.updateProjectionMatrix();

        renderer.setSize( render_w, render_h );
    }
}

function scene_init() {
    scene.add(cube);
    scene.add(new THREE.AxesHelper(2));// 축 생성

    light.position.set(-2, 2, 2);
    light.target = cube;
    scene.add(light);
    scene.add( new THREE.AmbientLight( 0x222222 ) );// 광원 설정, 장면에 추가 

    light_helper = new THREE.DirectionalLightHelper(light, 0.3);
    scene.add( light_helper );

    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 1, 0);

    //controls.target.set( 0, 0, 0 );
}/// 전체적인 장면의 세부 설정 함수

function SetOrbitControls(enable_orbitctr){
    // controls.enabled = enable_orbitctr;
    // controls.enablePan = true;
    // controls.enableZoom = true;
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.05;
    // controls.update();
}
/*
render_animation();
function render_animation(){
    window.requestAnimationFrame(render_animation);
    controls.update();
    renderer.render(scene, camera);
}
/**/
// I strongly recommend you guys to read "Lambda function/code" articles
let z = 5;
renderer.setAnimationLoop( ()=>{
    //controls.update();
    setScale(camera);
    renderer.render( scene, camera );
} );
/**/
function mouseDownHandler(e) {
}

function mouseMoveHandler(e) {
}


function mouseWheel(e) {
    const d = camera.position.distanceTo( new THREE.Vector3());
    
    if(e.wheelDelta > 0){
        const newD = d - 0.1;
        camera.position.x *= ( newD / d);
        camera.position.y *= ( newD / d);
        camera.position.z *= ( newD / d);
    }
    if(e.wheelDelta < 0){
        const newD = d + 0.1;
        camera.position.x *= ( newD / d);
        camera.position.y *= ( newD / d);
        camera.position.z *= ( newD / d);
    } 
}

function setScale(camera) {
    camera.position.x = camera.position.x;
    camera.position.y = camera.position.y;
    camera.position.z = camera.position.z;
}
