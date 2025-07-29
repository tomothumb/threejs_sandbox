/**
 * @tutorial
 * https://qiita.com/watabo_shi/items/2fc671f2147e799787f9
 */
import * as THREE from 'three';

// ドラッグできるようにする
import {OrbitControls} from "three/addons/controls/OrbitControls";


// dat.gui
import * as dat from 'dat.gui';

////////
let main_camera, main_scene, main_renderer;


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
}

// 頂点シェーダー
const shader_src = {
    vertex : `
        varying vec2 vUv;
        void main() {
          vUv = uv;// uv: ShaderMaterialで補完される vec2 型(xy)の変数。テクスチャ座標のこと。

          vec3 pos = position;
          // pos.y = ( pos.y * 0.5 ) + sin( pos.x * 3.0 ) * 0.5;// 縦を半分のサイズにして、sinでy座標を歪ませる
          gl_Position = vec4( pos*0.2, 1.0 );
          // gl_Position = vec4(position, 1.0);
        }`,
    fragment : `
        varying vec2 vUv;
        uniform sampler2D uTex;// テクスチャは sampler2D 型
        void main() {
          vec3 color = texture2D( uTex, vUv ).rgb;// texture2D() でテクスチャのuv座標地点の色 rgba を取得
          gl_FragColor = vec4( color, 1.0 );
          // vec4 color = vec4(1.0, 0.0, 1.0, 1.0);// rgba
          // gl_FragColor = color;
        }`
}


function init(){
    console.log('fn init')

    setupRenderer();
    setupScene();
    setupCamera();
    // setupFog();
    setupHelpers();
    // setupDebugger();

    setupMain();

    requestAnimationFrame( render );
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
    const geo_cube = new THREE.BoxGeometry(10, 10, 10);
    // const geo_cube = new THREE.BufferGeometry();

    const mat_point = new THREE.PointsMaterial({
        size: _SETTING.PARTICLE_SIZE,
        // color: _SETTING.PARTICLE_COLOR,
        vertexColors: true
    });
    const mesh_point = new THREE.Points(geo_cube, mat_point);
    mesh_point.position.set(0, 50, 0);
    main_scene.add( mesh_point );

    const mat_lambert = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh_lambert = new THREE.Mesh(geo_cube, mat_lambert);
    mesh_lambert.position.set(0, 30, 0);
    main_scene.add( mesh_lambert );


    const img_texture = new THREE.TextureLoader().load( './texture_01.jpg' );
    img_texture.colorSpace = THREE.SRGBColorSpace;
    const mat_texture = new THREE.MeshBasicMaterial( { map: img_texture } );
    // const mat_texture = new THREE.TextureLoader().load('./texture_01.jpg' );
    const mesh_texture = new THREE.Mesh(geo_cube, mat_texture);
    mesh_texture.position.set(0, 10, 0);
    main_scene.add( mesh_texture );


    const geo_shader = new THREE.PlaneGeometry(2, 2, 1, 1);
    const mat_shader = new THREE.ShaderMaterial( {
        uniforms: {
            uTex: { value: img_texture }// テスクチャを uTex として渡す
        },
        vertexShader: shader_src.vertex,
        fragmentShader: shader_src.fragment,
        wireframe: false
    } );
    // const mat_texture = new THREE.TextureLoader().load('./texture_01.jpg' );
    const mesh_shader = new THREE.Mesh(geo_shader, mat_shader);
    mesh_shader.position.set(0, -10, 0);
    main_scene.add( mesh_shader );

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

    main_renderer.clear()
    main_renderer.render(main_scene, main_camera);
}

function onWindowResize(){
    main_camera.aspect = window.innerWidth / window.innerHeight;
    main_camera.updateProjectionMatrix();
    main_renderer.setSize( window.innerWidth, window.innerHeight );
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
