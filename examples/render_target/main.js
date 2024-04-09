/**
 * https://threejs.org/manual/#ja/rendertargets
 */
import * as THREE from 'three';
import {MeshStandardMaterial} from "three";

let main_camera, main_scene, main_renderer, main_cube;
let rt, rt_camera, rt_scene, rt_cubes, rt_geometry;
const background_color = 0x8A8A00
const canvas = document.querySelector( '#webgl_canvas' );

const setting_main = {
    fov: 75,
    near : .1,
    far: 5,
    aspect: 2,

    light_color: 0xFFFFFF,
    light_intensity: 1,
    light_x: -1,
    light_y: 2,
    light_z: 4,
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
    rt_camera.position.z = 2;
    // シーンを作成
    rt_scene = new THREE.Scene();
    rt_scene.background = new THREE.Color('yellow');
    // ライト
    const rt_light = new THREE.DirectionalLight( setting_rt.light_color, setting_rt.light_intensity );
    rt_light.position.set( setting_rt.light_x, setting_rt.light_y, setting_rt.light_z );
    rt_scene.add( rt_light );

    // キューブを設置
    rt_geometry = new THREE.BoxGeometry(setting_rt.box_w, setting_rt.box_h*2, setting_rt.box_d);
    rt_cubes = [
        makeInstance(rt_geometry, 0x99FFCC,  0),
        makeInstance(rt_geometry, 0xCC99FF, -1.5),
        makeInstance(rt_geometry, 0xFFCC99,  1.5),
    ];

}


function setupMainScene(){
    // カメラ
    main_camera = new THREE.PerspectiveCamera( setting_main.fov, setting_main.aspect, setting_main.near, setting_main.far );
    main_camera.position.z = 2;
    // シーン
    main_scene = new THREE.Scene();
    main_scene.background = new THREE.Color(background_color);

    // ライト
    const main_light = new THREE.DirectionalLight( setting_main.light_color, setting_main.light_intensity );
    main_light.position.set( setting_main.light_x, setting_main.light_y, setting_main.light_z );
    main_scene.add( main_light );

    // テクスチャとしてマッピングする
    // const main_material2 = new THREE.MeshStandardMaterial({
    //     color: 0xFF3399
    // })
    const main_material = new THREE.MeshPhongMaterial( {
        map: rt.texture,
        // color: 0xFF3399
    });
    const main_geometry = new THREE.BoxGeometry(setting_rt.box_w*2, setting_rt.box_h, setting_rt.box_d);

    // 入れ子にする
    main_cube = new THREE.Mesh( main_geometry, main_material );
    main_cube.rotation.x = 0.5;
    main_cube.rotation.y = 0.5;
    main_scene.add( main_cube );
}


function render(time){
    // console.log('fn render')
    time *= 0.001;

    if ( resizeRendererToDisplaySize( main_renderer ) ) {
        const canvas = main_renderer.domElement;
        main_camera.aspect = canvas.clientWidth / canvas.clientHeight;
        main_camera.updateProjectionMatrix();
    }

    // rotate all the cubes in the render target scene
    rt_cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
    });

    // draw render target scene to render target
    main_renderer.setRenderTarget(rt);
    main_renderer.render(rt_scene, rt_camera);
    main_renderer.setRenderTarget(null);

    // rotate the cube in the scene
    // main_cube.rotation.x = time;
    // main_cube.rotation.y = time * 1.1;

    // render the scene to the canvas
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


function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({color});

    const cube = new THREE.Mesh(geometry, material);
    rt_scene.add(cube);

    cube.position.x = x;

    return cube;
}

init();

