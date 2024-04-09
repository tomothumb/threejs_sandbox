/**
 * @tutorial
 * https://www.youtube.com/watch?v=xJAfLdUgdc4
 */
import * as THREE from 'three';
// ドラッグできるようにする
import {OrbitControls} from "three/addons/controls/OrbitControls";
// dat.gui
import * as dat from 'dat.gui';


let main_camera, main_scene, main_renderer, main_material, main_mesh;
let plane_mesh, sphere_mesh, sphere_material, spotLight;
let wave_plate_mesh, wave_plate_geometry;
let shader_wave_mesh;
const background_color = 0xCCCCCC
const canvas = document.querySelector( '#webgl_canvas' );

const clock = new THREE.Clock();
const gui = new dat.GUI();
const guiOption = {
    sphereColor: '#FF0000',
    wireframe: false,
    speed: 0.01,
    wave_speed: 5,
    wave_segment: 10,
}

const setting = {
    fov: 75, //  field of view (視野角)
    near : .1, // near clipping plane (前方クリップ面)
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
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragment : `
        uniform float time;
        varying vec2 vUv;
        void main() {
            // 画面の中心からの距離に基づいて色を計算
            vec3 color1 = vec3(1.0 * sin(time), 0, 0);
            vec3 color2 = vec3(0, 1.0 * cos(time + 2.0), 0);
            vec3 color3 = vec3(0, 0, 1.0 * sin(time + 5.0));
            vec3 color4 = vec3(1.0 * sin(time + 6.0), 1.0 * cos(time + 6.0), 0);
            vec3 gradient = mix(mix(color1, color2, vUv.x), mix(color3, color4, vUv.x), vUv.y);
            gl_FragColor = vec4(gradient, 1.0);
        }`
}

//
const waveShaderTpl = {
    vertex : `
        uniform float u_time;
        varying vec2 vUv;
        void main() {
            vUv = uv;
            float newX = sin(position.x * u_time)  * 10.0 + 10.0;
            vec3 newPosition = vec3(newX, position.y, position.z);
            // gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragment : `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        varying vec2 vUv;
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution;
            gl_FragColor = vec4(1.0-(u_mouse.x * u_mouse.y), u_mouse.x, u_mouse.y, 1.0);
            
        }`
}

const wave_uniforms = {
    u_time: {type: 'f', value: 0.0 },
    u_resolution: {
        type: 'v2',
        value: new THREE.Vector2(window.innerWidth, window.innerHeight)
            .multiplyScalar(window.devicePixelRatio)
    },
    u_mouse: {
        type: 'v2',
        value: new THREE.Vector2(50.0,50.0)
    }
}

window.addEventListener('mousemove', (e) => {
    wave_uniforms.u_mouse.value.set(
        e.screenX / window.innerWidth,
        1 - e.screenY / window.innerHeight)
});

function setupFog() {
    // フォグ
    main_scene.fog = new THREE.FogExp2(0xFFFFFF, 0.005);
}

function init(){
    console.log('fn init')
    // レンダラ
    main_renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
    main_renderer.shadowMap.enabled = true;
    setupMainScene();
    setupLights();
    setupFog();
    setupHelpers();

    setupWavePlate();
    setupShaderWavePlate();
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
    const ambient_light = new THREE.AmbientLight( 0x333333 );
    main_scene.add( ambient_light );

    // // ライト
    // const direction_light = new THREE.DirectionalLight( setting.light_color, setting.light_intensity );
    // direction_light.position.set( setting.light_x, setting.light_y, setting.light_z );
    // main_scene.add( direction_light );
    // direction_light.castShadow = true;
    // direction_light.shadow.camera.left = -20
    // direction_light.shadow.camera.right = 10
    // direction_light.shadow.camera.top = 10
    // direction_light.shadow.camera.bottom = -20

    // // ライトヘルパー
    // const dlightHelper = new THREE.DirectionalLightHelper( direction_light, 25 );
    // main_scene.add( dlightHelper );
    //
    // // カメラヘルパー
    // const dlightCameraHelper = new THREE.CameraHelper( direction_light.shadow.camera );
    // main_scene.add( dlightCameraHelper );

    const spotLight = new THREE.SpotLight(0xFFFFFF, 10, 150, Math.PI/5, 0, 0.5);
    main_scene.add( spotLight );
    spotLight.position.set( setting.light_x, setting.light_y, setting.light_z  );
    spotLight.castShadow = true;

    const spotLightHelper = new THREE.SpotLightHelper( spotLight );
    main_scene.add( spotLightHelper );

}

function setupDebugger(){

    gui.addColor(guiOption, 'sphereColor').onChange((val) => {
        sphere_material.color.set(val);
    });
    gui.add(guiOption, 'wireframe').onChange((val) => {
        sphere_material.wireframe = val;
    });
    gui.add(guiOption, 'speed', 0, 0.1)
    gui.add(guiOption, 'wave_speed', 1, 20)
    gui.add(guiOption, 'wave_segment', 2, 30).step(1).onChange(function(value) {
        updateWavePlate(value);
        updateShaderWavePlate(value);
    });


    //     .onChange((val) => {
    //     main_material.uniforms.time.value = val;
    //     main_material.uniforms.time.value = val;
    // });
}

// 平面ジオメトリを更新する関数
function updateWavePlate(value) {
    let newGeometry = new THREE.PlaneGeometry(setting.box_w*5, setting.box_w*5, value, value);
    wave_plate_mesh.geometry.dispose(); // 古いジオメトリをメモリから解放
    wave_plate_mesh.geometry = newGeometry;
}
function updateShaderWavePlate(value) {
    let newGeometry = new THREE.PlaneGeometry(setting.box_w*5, setting.box_w*5, value, value);
    shader_wave_mesh.geometry.dispose(); // 古いジオメトリをメモリから解放
    shader_wave_mesh.geometry = newGeometry;
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
    main_camera.position.set( 5,10, 30);
    const orbit = new OrbitControls(main_camera, canvas);
    orbit.update();

    // シーン
    main_scene = new THREE.Scene();
    main_scene.background = new THREE.Color(background_color);


    // テクスチャとしてマッピングする
    // const main_material = new THREE.MeshStandardMaterial({
    //     color: 0xFF3399
    // })

    main_material = new THREE.ShaderMaterial({
        vertexShader: shaderTpl.vertex,
        fragmentShader: shaderTpl.fragment,
        uniforms: {
            time: { value: 0.0 }
        }
    });

    const main_geometry = new THREE.BoxGeometry(setting.box_w, setting.box_h, setting.box_d);
    // 入れ子にする
    main_mesh = new THREE.Mesh( main_geometry, main_material );
    main_mesh.rotation.x = 0.5;
    main_mesh.rotation.y = 0.5;
    main_scene.add( main_mesh );

    const plane_geometry = new THREE.PlaneGeometry(setting.box_w*5, setting.box_h*5);
    const plane_material = new THREE.MeshStandardMaterial( {
        color: 0xFFFFFF,
        side: THREE.DoubleSide // 両面表示
    } );
    plane_mesh = new THREE.Mesh( plane_geometry, plane_material );
    main_scene.add( plane_mesh );
    plane_mesh.receiveShadow = true;
    plane_mesh.rotation.x = -0.5 * Math.PI

    const sphere_geometry = new THREE.SphereGeometry( 10, setting.sphere_segments, setting.sphere_segments);
    sphere_material = new THREE.MeshLambertMaterial( {
        color: guiOption.sphereColor,
        wireframe: guiOption.wireframe,
    } );

    sphere_mesh = new THREE.Mesh( sphere_geometry, sphere_material );
    main_scene.add( sphere_mesh );
    sphere_mesh.position.x = -12;
    sphere_mesh.position.y = 5;
    sphere_mesh.position.z = 20;
    sphere_mesh.castShadow = true;

}

function setupShaderWavePlate(){

    const shader_wave_geometry = new THREE.PlaneGeometry( 40, 40, guiOption.wave_segment, guiOption.wave_segment );
    const shader_wave_material = new THREE.ShaderMaterial({
        vertexShader: waveShaderTpl.vertex,
        fragmentShader: waveShaderTpl.fragment,
        // wireframe: true,
        uniforms: wave_uniforms
    });
    shader_wave_mesh = new THREE.Mesh( shader_wave_geometry, shader_wave_material );
    main_scene.add(shader_wave_mesh)
    shader_wave_mesh.position.set(-30, 20, -30)
}


function setupWavePlate(){
    wave_plate_geometry = new THREE.PlaneGeometry( 40, 40, guiOption.wave_segment, guiOption.wave_segment );
    const wave_plate_material = new THREE.MeshStandardMaterial( {
        color: 0x00FFFF,
        wireframe: true,
        side: THREE.DoubleSide // 両面表示
    } );
    wave_plate_mesh = new THREE.Mesh( wave_plate_geometry, wave_plate_material );
    main_scene.add(wave_plate_mesh)
    wave_plate_mesh.position.set(20, 20, -30)
    wavedPlatePosition(1);
}

function wavedPlatePosition(time){

    const move_setting = [];
    for (let y = 0; y <= guiOption.wave_segment + 1; y++) {
        for (let x = 0; x <= guiOption.wave_segment + 1; x++) {
            const i = (y * (guiOption.wave_segment + 1)*3) + (x*3) + 2; // z座標のインデックス


            const reset_time = (time / guiOption.wave_speed) % (360) + (x * 30) + (y * 30)

            const degrees= reset_time
            const radians = degrees * (Math.PI / 180)
            wave_plate_mesh.geometry.attributes.position.array[i]
                = 2 * Math.sin( radians )
        }
    }

}

let step = 0;
function render(time){
    // console.log('fn render')

    if ( resizeRendererToDisplaySize( main_renderer ) ) {
        const canvas = main_renderer.domElement;
        main_camera.aspect = canvas.clientWidth / canvas.clientHeight;
        main_camera.updateProjectionMatrix();
    }

    main_material.uniforms.time.value += 0.01;
    main_mesh.rotation.x += 0.01
    main_mesh.rotation.y += 0.01

    step += guiOption.speed
    sphere_mesh.position.y = 20 * Math.abs(Math.sin(step));

    // 波
    wavedPlatePosition(time);
    wave_plate_mesh.geometry.attributes.position.needsUpdate = true


    wave_uniforms.u_time.value = clock.getElapsedTime();


    main_renderer.render( main_scene, main_camera );
    requestAnimationFrame( render );
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
