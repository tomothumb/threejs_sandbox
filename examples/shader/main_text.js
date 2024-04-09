import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
const fontLoader = new FontLoader();

let main_camera, main_scene, main_renderer, main_material, main_mesh;
let rt, rt_camera, rt_scene, rt_material, rt_cubes, rt_geometry, rt_mesh;
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
    box_w: 30,
    box_h: 30,
    box_d: 30,
}

const setting_rt = {
    fov : 75,
    near : 0.1,
    far : 5,
    width: 512,
    height: 512,

    light_color: 0xFFFFFF,
    light_intensity: 1,
    light_x: -1,
    light_y: 2,
    light_z: 4,

    box_w: 1,
    box_h: 1,
    box_d: 1,
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
        uniform float time;
        varying vec2 vUv;
        void main() {
            // 画面の中心からの距離に基づいて色を計算
            // vec3 color1 = vec3(1.0, 0.0, 0.0); // 例えば赤
            // vec3 color2 = vec3(0.0, 1.0, 0.0); // 例えば緑
            // vec3 color3 = vec3(0.0, 0.0, 1.0); // 例えば青
            // vec3 color4 = vec3(1.0, 1.0, 0.0); // 例えば黄色
            // vec3 gradient = mix(mix(color1, color2, vUv.x), mix(color3, color4, vUv.x), vUv.y);
            // gl_FragColor = vec4(gradient, 1.0);
            
            // vec3 color = vec3(vUv.x + sin(time), vUv.y + cos(time), sin(time) * cos(time));
            // gl_FragColor = vec4(color, 1.0);
            
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
    setupRenderTarget();
    setupMainScene();
    requestAnimationFrame( render );
}


function setupRenderTarget(){
    rt = new THREE.WebGLRenderTarget(setting_rt.width, setting_rt.height)
    const rt_aspect = setting_rt.width / setting_rt.height;

    // レンダラーを作成
    // カメラを作成
    rt_camera = new THREE.PerspectiveCamera(setting_rt.fov, rt_aspect, setting_rt.near, setting_rt.far);
    rt_camera.position.z = 0.2;
    // シーンを作成
    rt_scene = new THREE.Scene();
    // rt_scene.background = new THREE.Color('yellow');
    // ライト
    const rt_light = new THREE.DirectionalLight( setting_rt.light_color, setting_rt.light_intensity );
    rt_light.position.set( setting_rt.light_x, setting_rt.light_y, setting_rt.light_z );
    rt_scene.add( rt_light );

    // rt_geometry = new THREE.BoxGeometry(setting_rt.box_w, setting_rt.box_h*2, setting_rt.box_d);

    rt_material = new THREE.ShaderMaterial({
        vertexShader: setting_shader.vertex,
        fragmentShader: setting_shader.fragment,
        uniforms: {
            time: { value: 0.0 }
        }
    })
    // const main_geometry = new THREE.BoxGeometry(setting_main.box_w, setting_main.box_h, setting_main.box_d);
    const rt_geometry = new THREE.PlaneGeometry(setting_main.box_w, setting_main.box_h);

    // 入れ子にする
    rt_mesh = new THREE.Mesh( rt_geometry, rt_material );
    rt_mesh.rotation.x = 0.5;
    rt_mesh.rotation.y = 0.5;
    rt_scene.add( rt_mesh );
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


    const font = fontLoader.load('../fonts/Madimi One_Regular.json',
        function ( font ) {
            // do something with the font
            console.log(font)
            const textGeometry = new TextGeometry('Hello,Three.js!', {
                font: font,
                size: 3,
                height: 0,
                curveSegments: 50,
                bevelEnabled: false,
                bevelThickness: 0,
                bevelSize: 0,
                bevelSegments: 0
            });
            textGeometry.computeBoundingBox();
            const centerOffset = - 0.5 * ( textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x );

            // const textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const textMaterial = new THREE.MeshPhongMaterial( {
                map: rt.texture,

                // color: 0xFF3399
            });


            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.x = centerOffset;
            textMesh.position.y = 0;
            textMesh.position.z = 0;

            // textMesh.rotation.x = Math.PI * 1;
            // textMesh.rotation.y = Math.PI * 1;

            main_scene.add(textMesh);
        },

        // onProgress callback
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },

        // onError callback
        function ( err ) {
            console.log( 'An error happened' );
        });


    // const main_geometry = new THREE.BoxGeometry(setting_main.box_w, setting_main.box_h, setting_main.box_d);
    const main_geometry = new THREE.PlaneGeometry(setting_main.box_w, setting_main.box_h);

    // 入れ子にする
    // main_mesh = new THREE.Mesh( main_geometry, main_material );
    // main_mesh.rotation.x = 0.5;
    // main_mesh.rotation.y = 0.5;
    // main_scene.add( main_mesh );
}


function render(time){
    // console.log('fn render')
    time *= 0.001;

    if ( resizeRendererToDisplaySize( main_renderer ) ) {
        const canvas = main_renderer.domElement;
        main_camera.aspect = canvas.clientWidth / canvas.clientHeight;
        main_camera.updateProjectionMatrix();
    }

    rt_material.uniforms.time.value += 0.01;
    main_renderer.setRenderTarget(rt);
    main_renderer.render(rt_scene, rt_camera);
    main_renderer.setRenderTarget(null);


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
