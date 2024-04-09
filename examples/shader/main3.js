import * as THREE from 'three';

// ドラッグできるようにする
import {OrbitControls} from "three/addons/controls/OrbitControls";

let main_camera, main_scene, main_renderer, main_material, main_mesh;
let plane_mesh, sphere_mesh;
const background_color = 0xFAFAFA
const canvas = document.querySelector( '#webgl_canvas' );

const setting = {
    fov: 75, //  field of view (視野角)
    near : .1, // near clipping plane (前方クリップ面)
    far: 1000, // far clipping plane (後方クリップ面)
    // aspect: 2,
    light_color: 0xFFFFFF,
    light_intensity: 1,
    light_x: -1,
    light_y: 2,
    light_z: 4,
    box_w: 10,
    box_h: 10,
    box_d: 10,
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



function init(){
    console.log('fn init')
    // レンダラ
    main_renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
    setupMainScene();
    requestAnimationFrame( render );
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

    // グリッドヘルパー
    const gridHelper = new THREE.GridHelper( 100, 50 );
    main_scene.add( gridHelper );

    // 軸ヘルパー
    const axesHelper = new THREE.AxesHelper( 100 );
    main_scene.add( axesHelper );

    // ライト
    const main_light = new THREE.DirectionalLight( setting.light_color, setting.light_intensity );
    main_light.position.set( setting.light_x, setting.light_y, setting.light_z );
    main_scene.add( main_light );

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

    const plane_geometry = new THREE.PlaneGeometry(setting.box_w*2, setting.box_h*2);
    const plane_mMaterial = new THREE.MeshBasicMaterial( {
        color: 0xffff00,
        side: THREE.DoubleSide // 両面表示
    } );
    const plane_mesh = new THREE.Mesh( plane_geometry, plane_mMaterial );
    main_scene.add( plane_mesh );

    const sphere_geometry = new THREE.SphereGeometry( 10, setting.sphere_segments, setting.sphere_segments);
    const sphere_material = new THREE.MeshLambertMaterial( {color: 0xff0000,
        wireframe: true,
    } );
    const sphere_mesh = new THREE.Mesh( sphere_geometry, sphere_material );
    main_scene.add( sphere_mesh );
    sphere_mesh.position.x = -10;
    sphere_mesh.position.y = 5;

}


function render(time){
    // console.log('fn render')
    time *= 0.001;

    if ( resizeRendererToDisplaySize( main_renderer ) ) {
        const canvas = main_renderer.domElement;
        main_camera.aspect = canvas.clientWidth / canvas.clientHeight;
        main_camera.updateProjectionMatrix();
    }

    main_material.uniforms.time.value += 0.01;
    main_mesh.rotation.x += 0.01
    main_mesh.rotation.y += 0.01

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
    }
    return needResize;
}

init();
