/**
 * @tutorial
 * https://www.youtube.com/watch?v=xJAfLdUgdc4
 */
import * as THREE from 'three';

// ドラッグできるようにする
import {OrbitControls} from "three/addons/controls/OrbitControls";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';


// dat.gui
import * as dat from 'dat.gui';
import {ShaderPass} from "three/addons/postprocessing/ShaderPass";
import {LuminosityShader} from "three/addons/shaders/LuminosityShader";

////////
let main_camera, main_scene, main_renderer;
let main_material, main_mesh
let main_composer
let box_rendertarget
let vertices = []
let vertices_colors = []


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
    // setupFog();
    setupHelpers();
    // setupDebugger();

    setupParticles();

    setupMain();
    setupEffect();

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

    //ジオメトリ
    // 形状データを作成
    const main_geometry = new THREE.BufferGeometry();
    main_geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    main_geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( vertices_colors, 3 ) );
    main_geometry.computeBoundingSphere();

    //マテリアル
    main_material = new THREE.PointsMaterial({
        size: _SETTING.PARTICLE_SIZE,
        // color: _SETTING.PARTICLE_COLOR,
        vertexColors: true
    });

    //mesh
    main_mesh = new THREE.Points(main_geometry, main_material);
    main_scene.add( main_mesh );

}

function setupEffect(){

    const parameters = {
        stencilBuffer: true
    };
    box_rendertarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, parameters );

    const renderPass = new RenderPass( main_scene, main_camera );
    renderPass.clear = true;
    const glitchPass = new GlitchPass();
    const luminosityPass = new ShaderPass(LuminosityShader);

    main_composer = new EffectComposer( main_renderer, box_rendertarget );
    main_composer.setSize(window.innerWidth, window.innerHeight);
    main_composer.addPass( renderPass );
    main_composer.addPass( glitchPass );
    main_composer.addPass(luminosityPass);

}


function setupRenderer() {
    // レンダラ
    main_renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        canvas
    });
    main_renderer.setClearColor(0x000000, 0); // 黒と完全な透明を設定
    main_renderer.setSize(window.innerWidth, window.innerHeight);
    main_renderer.setPixelRatio(window.devicePixelRatio); // Add this line
    main_renderer.autoClear = false;
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
    main_camera.position.set( 5,10, 150);
    const orbit = new OrbitControls(main_camera, canvas);
    orbit.update();
}

function setupScene(){
    // シーン
    main_scene = new THREE.Scene();
}



let step = 0;
function render(time){
    requestAnimationFrame( render );
    // console.log('fn render')

    // main_renderer.render(main_scene, main_camera);
    // main_renderer.render(sceneC, main_camera);
    main_composer.render();
}

function onWindowResize(){
    main_camera.aspect = window.innerWidth / window.innerHeight;
    main_camera.updateProjectionMatrix();
    main_renderer.setSize( window.innerWidth, window.innerHeight );
    main_composer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);


init();



function setupFog() {
    // フォグ
    main_scene.fog = new THREE.FogExp2(0xFFFFFF, 0.002);
}
function setupHelpers(){

    // グリッドヘルパー
    const gridHelper = new THREE.GridHelper( 100, 50 );
    main_scene.add( gridHelper );

    // 軸ヘルパー
    const axesHelper = new THREE.AxesHelper( 100 );
    main_scene.add( axesHelper );
}
