import * as THREE from 'three';

let main_camera, main_scene, main_renderer, main_mesh;
const background_color = 0x8A8A00
const canvas = document.querySelector( '#webgl_canvas' );

const setting_main = {
    fov: 75,
    near : .1,
    far: 4,
    aspect: 2,

    light_color: 0xFFFFFF,
    light_intensity: 1,
    light_x: -1,
    light_y: 2,
    light_z: 4,
    box_w: 15,
    box_h: 15,
    box_d: 15,
}

// 頂点シェーダー
const setting_shader = {
    vertex : `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragment : `
        varying vec2 vUv;
        void main() {
            // 画面の中心からの距離に基づいて色を計算
            vec3 color1 = vec3(1.0, 0.0, 0.0); // 例えば赤
            vec3 color2 = vec3(0.0, 1.0, 0.0); // 例えば緑
            vec3 color3 = vec3(0.0, 0.0, 1.0); // 例えば青
            vec3 color4 = vec3(1.0, 1.0, 0.0); // 例えば黄色
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
    main_camera = new THREE.PerspectiveCamera( setting_main.fov, setting_main.aspect, setting_main.near, 1000 );
    main_camera.position.z = 20;
    // シーン
    main_scene = new THREE.Scene();
    main_scene.background = new THREE.Color(background_color);

    // ライト
    const main_light = new THREE.DirectionalLight( setting_main.light_color, setting_main.light_intensity );
    main_light.position.set( setting_main.light_x, setting_main.light_y, setting_main.light_z );
    main_scene.add( main_light );

    // テクスチャとしてマッピングする
    // const main_material = new THREE.MeshStandardMaterial({
    //     color: 0xFF3399
    // })

    const main_material = new THREE.ShaderMaterial({
        vertexShader: setting_shader.vertex,
        fragmentShader: setting_shader.fragment
    });

    // const main_geometry = new THREE.BoxGeometry(setting_main.box_w, setting_main.box_h, setting_main.box_d);
    const main_geometry = new THREE.PlaneGeometry(setting_main.box_w, setting_main.box_h);

    // 入れ子にする
    main_mesh = new THREE.Mesh( main_geometry, main_material );
    main_mesh.rotation.x = 0.5;
    main_mesh.rotation.y = 0.5;
    main_scene.add( main_mesh );
}


function render(time){
    // console.log('fn render')
    time *= 0.001;

    if ( resizeRendererToDisplaySize( main_renderer ) ) {
        const canvas = main_renderer.domElement;
        main_camera.aspect = canvas.clientWidth / canvas.clientHeight;
        main_camera.updateProjectionMatrix();
    }

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
