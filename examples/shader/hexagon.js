/**
 * @tutorial
 * shadertoy.com
 * glslsandbox.com
 * shaderfrog.com
 */
import * as THREE from 'three';
// ドラッグできるようにする
import {OrbitControls} from "three/addons/controls/OrbitControls";
// dat.gui
import * as dat from 'dat.gui';


let main_camera, main_scene, main_renderer, shader_material, shader_mesh;
let plane_mesh;
const background_color = 0xCCCCCC
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

const setting = {
    fov: 5, //  field of view (視野角)
    near : 1, // near clipping plane (前方クリップ面)
    far: 1000, // far clipping plane (後方クリップ面)
    // aspect: 2,
    light_color: 0xFFFFFF,
    light_intensity: 1,
    light_x: -20,
    light_y: 50,
    light_z: 40,
    box_w: 8,
    box_h: 8,
    box_d: 8,
    sphere_segments: 50,
}

// 頂点シェーダー
const shaderTpl = {
    vertex : `
        uniform float radius; // 半径
        uniform float uTime; // 経過時間

        varying vec3 vPosition;

        const float PI  = 3.141592653589793;
        const float PI2 = PI * 2.;

        float atan2(in float y, in float x){
            return x == 0.0 ? sign(y) * PI / 2.0 : atan(y, x);
        }

        void main() {
             // 頂点の元の位置
            vec3 transformed = position;

            // 頂点の角度（ラジアン） // atan2 のように動作
            // 頂点の角度（ラジアン）を0から2πの範囲に変換
            float angle = atan2(transformed.y, transformed.x);
            

            // 変形の強さを調整
            // float wave_strength - 0.0;
            float wave_strength_max = 0.05;
            float wave_strength = sin(uTime*2.0) * wave_strength_max;
            
            // 6角形に滑らかに変形するための補正
            float shape = 6.0;
            
            float rawProgress = sin(uTime * 2.0); // sin波を0～1の範囲に変換
            // イージングの強度を調整
            float easeStrength = 1.0;
            // float easedProgress = pow(rawProgress, easeStrength) + 0.01;
            float easedProgress = rawProgress * 0.05;

            // float scale = 1.0 + 0.1 * cos(shape * angle);
            float scale = 1.0 + easedProgress * cos(shape * angle);
            transformed.xy *= scale;
            
            // フラグメントシェーダーに位置を渡す
            vPosition = transformed;
            

            // 頂点を変形させた位置に配置
            gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
        }
    `,
     fragment : `
        uniform float uTime; // 経過時間
        uniform vec3 color;
        uniform float radius; // 半径
        uniform float thickness;
        varying vec3 vPosition;

        void main() {
        
            // 変形したシェイプの中心からの距離を計算
            float dist = length(vPosition.xy); // 中心からの距離
            
            // ピクセルの位置に基づいて描画を制御
            // if (10.0 > dist) {
            //     discard; // 内側の 90% のサイズ部分をくり抜く
            // }
        
            // gl_FragColor = vec4(color, 1.0);
            
            // vPosition の x 座標を利用して色を決める
            float intensity = vPosition.x * 0.1 + 0.1; // -1.0 ～ 1.0 を 0.0 ～ 1.0 にマッピング
            gl_FragColor = vec4(color * intensity, 1.0);
        }
    `
}


// window.addEventListener('mousemove', (e) => {
//     wave_uniforms.u_mouse.value.set(
//         e.screenX / window.innerWidth,
//         1 - e.screenY / window.innerHeight)
// });

function setupFog() {
    // フォグ
    main_scene.fog = new THREE.FogExp2(0xFFFFFF, 0.005);
}

function init(){
    console.log('fn init')
    // レンダラ
    main_renderer = new THREE.WebGLRenderer( {
        antialias: true,
        stencil: true ,
        canvas } );
    main_renderer.shadowMap.enabled = true;
    setupMainScene();
    setupLights();
    // setupFog();
    setupHelpers();
    setupDebugger();
    requestAnimationFrame( render );
}

function setupHelpers(){

    // グリッドヘルパー
    const gridHelper = new THREE.GridHelper( 100, 50 );
    main_scene.add( gridHelper );

    // 軸ヘルパー
    const axesHelper = new THREE.AxesHelper( 100 );
    main_scene.add( axesHelper );
}

function setupLights(){

    // 環境光
    const ambient_light = new THREE.AmbientLight( 0xFFFFFF );
    main_scene.add( ambient_light );
}

function setupDebugger(){

    gui.add(guiOption, 'speed', 2, 30)
        .step(1)
        .onChange(function(value) {
    //     updateWavePlate(value);
    //     updateShaderWavePlate(value);
    //     shader_material.uniforms.uTime.value = val;
    //     shader_material.uniforms.uTime.value = val;
    });
}


function setupMainScene(){

    // カメラ
    main_camera = new THREE.PerspectiveCamera(
        setting.fov,
        canvas.clientWidth / canvas.clientHeight,
        setting.near,
        setting.far
    );
    main_camera.position.z = 20;
    main_camera.position.set( 45,90, 400);
    const orbit = new OrbitControls(main_camera, canvas);
    orbit.update();

    // シーン
    main_scene = new THREE.Scene();
    main_scene.background = new THREE.Color(background_color);

    // シンプルなマテリアル
    const simple_material = new THREE.MeshStandardMaterial({
        color: 0x00FF00,
        side: THREE.DoubleSide,
        wireframe: true,
    });


    const circle_radius = 15;
    const circle_segments = 180;
    const shader_geometry = new THREE.CircleGeometry(circle_radius, circle_segments );


    // shader
    shader_material = new THREE.ShaderMaterial({
        vertexShader: shaderTpl.vertex,
        fragmentShader: shaderTpl.fragment,
        uniforms: {
            uTime: { value: 0.0 },
            color: { value: new THREE.Color(0xff0000) },
            radius: { value: circle_radius },
            thickness: { value: 1 }, // 円周の太さ

        },
        transparent: true,
        // wireframe: true,
    });

    // 入れ子にする
    shader_mesh = new THREE.Mesh( shader_geometry, shader_material );
    shader_mesh.rotation.x = 0.5;
    shader_mesh.rotation.y = 0.5;
    main_scene.add( shader_mesh );

    const plane_geometry = new THREE.PlaneGeometry(setting.box_w*5, setting.box_h*5);

    const plane_material = new THREE.MeshStandardMaterial( {
        color: 0x0000FF,
        side: THREE.DoubleSide, // 両面表示
        transparent: true,
        opacity: 0.7,
    } );
    //透過度50%
    plane_mesh = new THREE.Mesh( plane_geometry, plane_material );
    main_scene.add( plane_mesh );
    plane_mesh.receiveShadow = true;
    plane_mesh.rotation.x = -0.5 * Math.PI
    plane_mesh.position.y = 1
    plane_mesh.name = 'demo_plate'

}



// let step = 0;
function render(time){
    requestAnimationFrame( render );

    if ( resizeRendererToDisplaySize( main_renderer ) ) {
        const canvas = main_renderer.domElement;
        main_camera.aspect = canvas.clientWidth / canvas.clientHeight;
        main_camera.updateProjectionMatrix();
    }

    shader_material.uniforms.uTime.value += 0.01;
    // shader_mesh.rotation.x += 0.01
    // shader_mesh.rotation.y += 0.01
    // step += guiOption.speed

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
