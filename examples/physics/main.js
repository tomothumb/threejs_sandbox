import * as THREE from 'three';
import * as CANNON from "cannon-es";


const background_color = 0x000000
const GRAVITY = 9.82;
let renderer, camera, scene;
let meshs = {};

// Cannon.js
let world;
let CannonObjects = {}


function setupApplication(){

    // 地面
    const groundMesh = new THREE.Mesh(
        new THREE.BoxGeometry(70, 0.02, 70),
        new THREE.MeshPhongMaterial({
            color: 0xFF3300,
            transparent: true,
            opacity: 0.5,
        }),
    );
    scene.add(groundMesh);
    meshs['ground'] = groundMesh;


    // 立方体
    const cubeMesh = new THREE.Mesh(
        new THREE.BoxGeometry( 10, 10, 10 ),
        new THREE.MeshBasicMaterial( {
            color: 0xFFFF99,
            transparent: true,
            opacity: 0.75,
        } )
    );
    scene.add( cubeMesh );
    meshs['cube'] = cubeMesh;

    // 球体
    const radius = 7;
    const sphereMesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 32),
        new THREE.MeshPhongMaterial({
            color: 0x99ff99,
            transparent: true,
            opacity: 0.75,
        }),
    );

    scene.add(sphereMesh);
    meshs['sphere'] = sphereMesh;

    // meshs['cube'].position.set(10, 100, 0);
    // meshs['sphere'].position.set(0, 100, 0);


}

function appendApplicationGravity(){
    const groundBody = new CANNON.Body({
        mass: 0, // static
        shape: new CANNON.Box(
            new CANNON.Vec3(80, 0.01, 80), // size
        ),
        material: new CANNON.Material({
            restitution: 0.5,
        }),
    });
    world.addBody(groundBody);
    CannonObjects['ground'] = groundBody;

    const cubeBody = new CANNON.Body({
        mass: 5, // kg
        shape: new CANNON.Box(
            new CANNON.Vec3(10, 10, 10), // size
        ),
        position: new CANNON.Vec3(12, 50, 0),

        material: new CANNON.Material({
            restitution: 0.5,
        }),
    });
    world.addBody(cubeBody);
    CannonObjects['cube'] = cubeBody;


    const radius = 2.5;
    const sphereBody = new CANNON.Body({
        mass: 5, // kg
        shape: new CANNON.Sphere(radius),
        position: new CANNON.Vec3(10, 30, 0),
        material: new CANNON.Material({
            restitution: 0.3,
        }),
    });
    world.addBody(sphereBody);
    CannonObjects['sphere'] = sphereBody;

    const constraint = new CANNON.PointToPointConstraint(
        new CANNON.Body({ mass: 0 }), // A body with mass 0 to represent the fixed point
        new CANNON.Vec3(0, 30, 0),   // Connection point in world space
        sphereBody,
        new CANNON.Vec3(-10, 0, 0),     // Connection point on the sphere, relative to the sphere's center
    );
    world.addConstraint(constraint);

}


function init(){
    console.log('fn init')
    setupRenderer();
    setupScene();
    setupLight();
    setupCamera();
    setupThreeHelpers();
    setupCannon();
    setupApplication();
    appendApplicationGravity();
    requestAnimationFrame( render );
}

const copy = () => {

    meshs['ground'].position.copy(CannonObjects['ground'].position);
    meshs['ground'].quaternion.copy(CannonObjects['ground'].quaternion);
    meshs['cube'].position.copy(CannonObjects['cube'].position);
    meshs['cube'].quaternion.copy(CannonObjects['cube'].quaternion);
    meshs['sphere'].position.copy(CannonObjects['sphere'].position);
    meshs['sphere'].quaternion.copy(CannonObjects['sphere'].quaternion);
};

function render(time){
    copy();
    world.fixedStep(); // framerate every 1 / 60 ms

    requestAnimationFrame( render );

    // meshs['cube'].rotation.x += 0.01;
    // meshs['cube'].rotation.y += 0.01;

    renderer.render( scene, camera );
}

init();

////////////////////

function setupRenderer(){
    renderer = new THREE.WebGLRenderer({antialias: false, alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
}

// シーンを作成
function setupScene(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(background_color);
}

function setupCamera(){
    // カメラを作成
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    // const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    // カメラの位置を設定
    camera.position.set( 5, 50, 100 );
    camera.position.z = 80;
    // カメラの向きを設定
    camera.lookAt( 0, 0, 0 );
}

function setupLight() {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);
}

function setupThreeHelpers(){
    // グリッドヘルパー
    const gridHelper = new THREE.GridHelper( 100, 50 );
    scene.add( gridHelper );

    // 軸ヘルパー
    const axesHelper = new THREE.AxesHelper( 100 );
    scene.add( axesHelper );
}


function setupCannon(){
    world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -1 * GRAVITY, 0),
    });
    // const body = new CANNON.Body({ ... });
    // world.addBody(body);
}
