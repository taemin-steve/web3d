/*
다른 폴더에 있는 모듈을 import 하는 방법 
import sys 
sys.path.insert(0, 'D:\바탕 화면\SW\web3d\js')
*/

import * as THREE from "./js/three.module.js";
import { OrbitControls } from "./js/OrbitControls.js";
import { GUI } from './js/dat.gui.module.js';


// https://threejsfundamentals.org/threejs/lessons/kr/threejs-fundamentals.html
const render_w = window.innerWidth;                                                 // window.innerWidth : browser window 창의 넓이
const render_h = window.innerHeight;

console.log(render_w, render_h);
console.log("aspectRatio: " + render_w/render_h);                                   // 화면비, 가로/세로 
console.log("devicePixelRatio: " + window.devicePixelRatio);                        // devicePixelRatio : 장치의 물리적 px과 CSS px의 비율값 반환 

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, render_w/render_h, 0.1, 100);       // fov, aspect, near, far 
const renderer = new THREE.WebGLRenderer();
//const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(render_w, render_h);

//const controls = new OrbitControls(camera, renderer.domElement);                   // camera가 target 주위를 공전, 제어할 카메라 객체, domElement 이벤트 리스터에 사용되는 HTML element
//matrixAutoUpdate 자동 호출 때문에 

const geometry = new THREE.BoxGeometry(1, 1, 1);                                    // width, height, depth
const texture = new THREE.TextureLoader().load( './teximg.jpg' );
const material = new THREE.MeshPhongMaterial( {color:0xFFFFFF, map:texture} );
const cube = new THREE.Mesh(geometry, material);
cube.matrixAutoUpdate = false;                                                      // 위치의 matrix를 계산하고 매 프레임마다 확대/축소하고 matrixWorld property를 자동 재계산한다 
                                                                                    // object가 정적이거나, 매뉴얼 업데이트를 원한다면 false로 설정하여 더 나은 퍼포먼스를 얻을 수 있다고 함 
const light = new THREE.DirectionalLight(0xFFFFFF, 1);                              // 직사광, 주로 태양을 표현할 때 사용 
let light_helper;
let mode_movement = "none";


dom_init();
scene_init();
//SetOrbitControls(false);


function dom_init() {
    const container = document.getElementById('render_div');
    container.appendChild(renderer.domElement);
    container.addEventListener("mousedown", mouseDownHandler, false);               // 마우스 클릭, 떼기 전까지 
    container.addEventListener("mousemove", mouseMoveHandler, false);               // 마우스가 움직였을 때 
    container.addEventListener("mouseup", mouseUpHandler, false);
    container.addEventListener("wheel", mouseWheel, false);                         // false >> bubbling 방식, 자식노드부터 이벤트가 발생하여 부모로 이벤트 전파
    container.addEventListener('contextmenu', function (e) { 
        e.preventDefault();                                                         // preventDefault : 현재 이벤트의 기본 동작을 중단한다
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
    scene.add(new THREE.AxesHelper(2));
    //scene.add(camera);

    light.position.set(-2, 2, 2);
    light.target = cube;
    scene.add(light);
    scene.add( new THREE.AmbientLight( 0x222222 ) );

    light_helper = new THREE.DirectionalLightHelper(light, 0.3);                    // light(the light to be visualized), size(dimensions of the plan)
    scene.add( light_helper );

    camera.matrixAutoUpdate = false;
    console.log(camera.matrixAutoUpdate, camera.matrixWorldNeedsUpdate, cube.matrixWorldNeedsUpdate);
    // .position, .lookAt, and .up for camera.matrixAutoUpdate = true setting
    // e.g., OrbitControls
    //camera.position.set(0, 0, 3);
    //camera.lookAt(0, 0, 0);
    //camera.up.set(0, 1, 0);
    //console.log(camera.matrix)
    
    let a = new THREE.Matrix4().makeTranslation(0, 0, 5);
    let b = new THREE.Matrix4().lookAt(
        new THREE.Vector3(5, 5, 5), 
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0)
    );

    // viewing matrix (or viewing transform)
    //camera.matrix.copy(a);// = new THREE.Matrix4().multiplyMatrices(a, b);
    camera.matrix.copy(a)
    camera.matrixWorldNeedsUpdate = true;
    //camera.updateMatrix();
    console.log(camera.matrix);
    console.log(camera.matrixWorld);
    //controls.target.set( 0, 0, 0 );

    // if you want to know object's position in world coordinate system!!
    //let pos = new THREE.Vector3();
    //cube.getWorldPosition(pos);
    //console.log(pos); 
}

function SetOrbitControls(enable_orbitctr){
    if (enable_orbitctr) camera.matrixAutoUpdate = true; 
    controls.enabled = enable_orbitctr;            // rotating
    controls.enablePan = true;                     // panning
    controls.enableZoom = true;                    // zooming
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.update(); // camera 변환설정을 수동으로 변경한 후에 호출 
}

/*
render_animation();
function render_animation(){
    window.requestAnimationFrame(render_animation);
    controls.update();
    renderer.render(scene, camera);
}
*/

// I strongly recommend you guys to read "Lambda function/code" articles
renderer.setAnimationLoop( ()=>{ // every available frame
    //controls.update();
    //cube.matrixAutoUpdate = true;
    renderer.render( scene, camera );
} );


var isRotating, isPanning;
let previousMousePosition = {
    x: 0,
    y: 0
};
let origin = new THREE.Vector3();
let vec1, vec2 = new THREE.Vector3();
let theta;
let rotationAxis = new THREE.Vector3();

function mouseDownHandler(e) {
    // Gecko (Firefox), WebKit (Safari/Chrome) & Opera -> which, IE, Opera -> button
    if (e.which==1 || e.button ==0)  
        isRotating = true;
    if (e.which==3 || e.button ==2)
        isPanning = true;
    
    previousMousePosition = {
        x : e.offsetX,
        y : e.offsetY
    };
}

function mouseMoveHandler(e) {
    camera.matrixAutoUpdate = false;
    camera.matrixWorldNeedsUpdate = true;

    // mousepoint convert to world coordinate system (x,y,z) : worldSpacePoint
    // screenSpacePoint : position of a 3D point in space along the ray in Normalized Device Coordinates    
    let screenSpacePoint = new THREE.Vector3(e.offsetX / render_w * 2 - 1 , -e.offsetY / render_h * 2 + 1, -1); // projectspace point
    let worldSpacePoint = screenSpacePoint.clone().unproject(camera);

    let preScreenSpacePoint = new THREE.Vector3(previousMousePosition.x / render_w * 2 - 1, -previousMousePosition.y / render_h * 2 + 1, -1); 
    let preWorldSpacePoint = preScreenSpacePoint.clone().unproject(camera);

    //covert pre <-> now well done...
    //console.log(preScreenSpacePoint);
    //console.log(screenSpacePoint); 
    
    if(isRotating) {
        vec1 = worldSpacePoint.sub(origin);
        vec2 = preWorldSpacePoint.sub(origin);

        let d1 = vec1.length();
        let d2 = vec2.length();

        rotationAxis = vec2.cross(vec1);
        theta = Math.acos((vec1.dot(vec2))/d1*d2)

        let quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(rotationAxis, -Math.abs(theta));

        let rotation_mat = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
        let camera_mat = camera.matrix.clone();
        camera_mat.premultiply(rotation_mat);  //what?
        camera.matrix.copy(camera_mat);
    }

    else if(isPanning) {
        vec1 = worldSpacePoint.sub(origin);
        vec2 = preWorldSpacePoint.sub(origin);

        let vec3 = vec1.sub(vec2);
        let transltation_mat = new THREE.Matrix4().makeTranslation(vec3.x * -30 , vec3.y * -30, vec3.z * -30);

        camera.matrix.premultiply(transltation_mat);
    }

    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
}

function mouseUpHandler(e) {
    isRotating = false;
    isPanning = false;
}

function mouseWheel(e) {
    //camera.matrixAutoUpdate = false;
    let cam_view = new THREE.Vector3(0, 0, -1); // in the camera space, -z is the viewing direction
    cam_view.transformDirection(camera.matrix); // refer to THREE.js doc
    //console.log(cam_view);

    let view_move = cam_view.clone();

    let mat_viewingTrans = new THREE.Matrix4();
    if(e.deltaY > 0) {
        // wheel down
        view_move.multiplyScalar(-0.1);
    }
    else {
        // wheel up
        view_move.multiplyScalar(0.1);
    }
    //console.log(view_move);
    mat_viewingTrans.makeTranslation(view_move.x, view_move.y, view_move.z);
    //console.log(mat_viewingTrans);

    let cam_mat_prev = camera.matrix.clone();
    // cam_mat_prev = mat_viewingTrans * cam_mat_prev
    cam_mat_prev.premultiply(mat_viewingTrans);
    // camera.matrix = cam_mat_prev
    camera.matrixWorldNeedsUpdate = true;
    camera.matrix.copy(cam_mat_prev);
    //console.log(camera.matrix);
}   

/*
        // direction is the normalized ray direction from the camera
        // pos is the position of the point in 3D space, "under the mouse"
        let direction = worldSpacePoint.sub(camera.position).normalize();
        let distance = - camera.position.z / direction.z;
        let pos = camera.position.clone().add(direction.multiplyScalar(distance));
        let position3D = {
            x : pos.x,
            y : pos.y,
            z : pos.z
        };

        
        //let mouse3D = projector.unprojectVector(screenSpacePoint);
        //ray.direction = mouse3D.subSelf(camera.position).normalize();
*/

/*
original panning

        let a = new THREE.Matrix4().makeTranslation(-10* (moveMousePosition.x/ render_w), 10* (moveMousePosition.y/ render_h), 0);
        camera.matrix.multiply(a);
        console.log(camera.matrix);

 */