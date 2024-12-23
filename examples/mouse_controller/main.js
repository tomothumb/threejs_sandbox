/**
 * @tutorial
 * https://www.youtube.com/watch?v=xJAfLdUgdc4
 */
import * as THREE from 'three';

// ドラッグできるようにする
import {OrbitControls} from "three/addons/controls/OrbitControls";
// dat.gui
import * as dat from 'dat.gui';

////////
let main_camera, main_scene, main_renderer;
let main_material, main_mesh;
let main_cube;
let main_cube2, main_cube3, main_cube4, main_cube5;
let main_cube6, main_cube7, main_cube8, main_cube9;
const vertices = []
const vertices_colors = []


const canvas = document.querySelector( '#webgl_canvas' );

// マウスコントローラー
const mousePosition = new THREE.Vector2();
window.addEventListener('mousemove', (e) => {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1
});


// Dat GUI
const gui = new dat.GUI();
const guiOption = {
    sphereColor: '#FF0000',
    wireframe: false,
    speed: 0.01,
    wave_speed: 5,
    wave_segment: 10,
}

const _SETTING = {
    CAMERA_fov: 75, //  field of view (視野角)
    CAMERA_near : .1, // near clipping plane (前方クリップ面)
    CAMERA_far: 1000, // far clipping plane (後方クリップ面)

    BG_COLOR: 0xEFEFEF,
    PARTICLE_SIZE: 0.5,
    PARTICLE_LENGTH: 10000,
    PARTICLE_COLOR: 0x0000FF,
}

function init(){
    console.log('fn init')

    setupRenderer();
    setupScene();
    setupCamera();
    setupLight();
    setupFog();
    setupHelpers();
    setupDebugger();

    setupParticles();
    setupMain();

    requestAnimationFrame( render );
}

function setupParticles(){
    const color = new THREE.Color();
    const n = 1000, n2 = n / 2; // particles spread in the cube

    for(let i = 0; i < _SETTING.PARTICLE_LENGTH; i++){
        // 座標
        const x = Math.random() * 100 - 50;
        const y = Math.random() * 100 - 50;
        const z = Math.random() * 100 - 50;
        vertices.push(x, y, z);

        // カラー
        const vx = ( x / 100 ) + 0.5;
        const vy = ( y / 100 ) + 0.5;
        const vz = ( z / 100 ) + 0.5;
        color.setRGB( vx, vy, vz, THREE.SRGBColorSpace );

        vertices_colors.push( color.r, color.g, color.b );
    }
    console.log(vertices_colors);

}


function setupLight() {
    // const directionalLight = new THREE.DirectionalLight(0xff0000, 0.8);
    // directionalLight.position.set(100, 100, 100);
    // main_scene.add(directionalLight);
}


function setupDebugger(){

    // gui.addColor(guiOption, 'sphereColor').onChange((val) => {
    //     // sphere_material.color.set(val);
    // });
    // gui.add(guiOption, 'wireframe').onChange((val) => {
    //     // sphere_material.wireframe = val;
    // });
    // gui.add(guiOption, 'speed', 0, 0.1)
    // gui.add(guiOption, 'wave_speed', 1, 20)
    // gui.add(guiOption, 'wave_segment', 2, 30).step(1).onChange(function(value) {
    //
    //     // updateWavePlate(value);
    //     // updateShaderWavePlate(value);
    // });

}

// 平面ジオメトリを更新する関数
function setupMain() {

    // const geometry_cube = new THREE.BoxGeometry( 10, 10, 10 );
    const geometry_cube = new THREE.CircleGeometry( 10, 100, 10 );
    // const material_cube = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const material_cube = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
    main_cube = new THREE.Mesh( geometry_cube, material_cube );
    main_cube2 = new THREE.Mesh( geometry_cube, material_cube );
    main_cube3 = new THREE.Mesh( geometry_cube, material_cube );
    main_cube4 = new THREE.Mesh( geometry_cube, material_cube );
    main_cube5 = new THREE.Mesh( geometry_cube, material_cube );
    main_cube6 = new THREE.Mesh( geometry_cube, material_cube );
    main_cube7 = new THREE.Mesh( geometry_cube, material_cube );
    main_cube8 = new THREE.Mesh( geometry_cube, material_cube );
    main_cube9 = new THREE.Mesh( geometry_cube, material_cube );
    main_scene.add( main_cube );
    main_cube2.position.x = 10;
    main_cube2.position.y = 30;
    main_cube2.position.z = -30;
    main_scene.add( main_cube2 );
    main_cube3.position.x = 30;
    main_cube3.position.y = 10;
    main_cube3.position.z = -60;
    main_scene.add( main_cube3 );
    main_cube4.position.x = 0;
    main_cube4.position.y = 0;
    main_cube4.position.z = -90;
    main_scene.add( main_cube4 );
    main_cube5.position.x = 10;
    main_cube5.position.y = 30;
    main_cube5.position.z = -120;
    main_scene.add( main_cube5 );
    main_cube6.position.x = 30;
    main_cube6.position.y = 10;
    main_cube6.position.z = -150;
    main_scene.add( main_cube6 );
    main_cube7.position.x = 0;
    main_cube7.position.y = 0;
    main_cube7.position.z = -180;
    main_scene.add( main_cube7 );
    main_cube8.position.x = 10;
    main_cube8.position.y = 30;
    main_cube8.position.z = -210;
    main_scene.add( main_cube8 );
    main_cube9.position.x = 30;
    main_cube9.position.y = 10;
    main_cube9.position.z = -240;
    main_scene.add( main_cube9 );


    //ジオメトリ
    // 形状データを作成
    // const main_geometry = new THREE.BufferGeometry();
    // main_geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    // main_geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( vertices_colors, 3 ) );
    // main_geometry.computeBoundingSphere();
    //
    // //マテリアル
    // main_material = new THREE.PointsMaterial({
    //     size: _SETTING.PARTICLE_SIZE,
    //     // color: _SETTING.PARTICLE_COLOR,
    //     vertexColors: true
    // });
    //
    // //mesh
    // main_mesh = new THREE.Points(main_geometry, main_material);
    //
    // //シーンに追加
    // main_scene.add( main_mesh );

    // // const main_material = new THREE.MeshStandardMaterial({
    // //     color: 0xFF3399
    // // })
    // main_material = new THREE.ShaderMaterial({
    //     vertexShader: shaderTpl.vertex,
    //     fragmentShader: shaderTpl.fragment,
    //     uniforms: {
    //         time: { value: 0.0 }
    //     }
    // });
    //
    // const main_geometry = new THREE.BoxGeometry(setting.box_w, setting.box_h, setting.box_d);
    // // 入れ子にする
    // main_mesh = new THREE.Mesh( main_geometry, main_material );
    // main_mesh.rotation.x = 0.5;
    // main_mesh.rotation.y = 0.5;
    // main_scene.add( main_mesh );
}

function setupRenderer() {
    // レンダラ
    main_renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    main_renderer.shadowMap.enabled = true;
}

function setupCamera(){
    // カメラ
    main_camera = new THREE.PerspectiveCamera(
        _SETTING.CAMERA_fov,
        canvas.clientWidth / canvas.clientHeight,
        _SETTING.CAMERA_near,
        _SETTING.CAMERA_far
    );
    main_camera.position.z = 20;
    main_camera.position.set( 15,15, 50);
    main_camera.lookAt( 15, 15, 0 );
    // main_camera.lookAt( 0, 0, 0 );
    // const orbit = new OrbitControls(main_camera, canvas);
    // orbit.update();
}

function setupScene(){
    // シーン
    main_scene = new THREE.Scene();
    main_scene.background = new THREE.Color(_SETTING.BG_COLOR);
}



let step = 0;
function render(time){
    requestAnimationFrame( render );

    // console.log('fn render')

    if ( resizeRendererToDisplaySize( main_renderer ) ) {
        const canvas = main_renderer.domElement;
        main_camera.aspect = canvas.clientWidth / canvas.clientHeight;
        main_camera.updateProjectionMatrix();
    }

    // main_material.uniforms.time.value += 0.01;
    // main_mesh.rotation.x += 0.01
    // main_mesh.rotation.y += 0.01

    step += guiOption.speed
    // main_camera.lookAt( 0, 0, 0 );
    // main_camera.lookAt( main_cube.position.x, main_cube.position.y, main_cube.position.z );

    main_renderer.render( main_scene, main_camera );
}



function resizeRendererToDisplaySize( renderer ) {

    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if ( needResize ) {
        renderer.setSize( width, height, false );
        // main_camera.aspect = window.innerWidth / window.innerHeight;
        // main_camera.updateProjectionMatrix();
    }
    return needResize;
}

init();



function setupFog() {
    // フォグ
    main_scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01);
}
function setupHelpers(){

    // グリッドヘルパー
    const gridHelper = new THREE.GridHelper( 100, 50 );
    main_scene.add( gridHelper );

    // 軸ヘルパー
    const axesHelper = new THREE.AxesHelper( 100 );
    main_scene.add( axesHelper );
}

let zoomSpeed = 0.05; // ズームの速度

window.addEventListener('wheel', (event) => {
    console.log(event.deltaY)
    main_cube.position.z += event.deltaY * zoomSpeed;
    main_cube2.position.z += event.deltaY * zoomSpeed;
    main_cube3.position.z += event.deltaY * zoomSpeed;
    main_cube4.position.z += event.deltaY * zoomSpeed;
    main_cube5.position.z += event.deltaY * zoomSpeed;
    main_cube6.position.z += event.deltaY * zoomSpeed;
    main_cube7.position.z += event.deltaY * zoomSpeed;
    main_cube8.position.z += event.deltaY * zoomSpeed;
    main_cube9.position.z += event.deltaY * zoomSpeed;
    // main_camera.position.z += event.deltaY * zoomSpeed;
});
