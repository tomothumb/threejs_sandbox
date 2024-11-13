import * as THREE from 'three';
import {OrbitControls} from "three/addons/controls/OrbitControls";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import {attachAmbientLight, attachCamera, attachHelpers, attachRenderer, attachScene} from "../common_lib/three_util";
const fontLoader = new FontLoader();

let main_camera, main_scene, main_renderer;
const canvas = document.querySelector( '#webgl_canvas' );

const setting = {
    background_color: 0xEFEFEF,
    fov: 45,
    near : .1,
    far: 1000,

    camera_x: 25,
    camera_y: 30,
    camera_z: 80,

    light_color: 0xFFFFFF,
}


function init(){
    console.log('fn init')

    main_renderer = attachRenderer(canvas);
    main_scene = attachScene(setting.background_color);
    main_camera = attachCamera(setting, canvas);
    const orbit = new OrbitControls(main_camera, canvas);
    orbit.update();

    main_scene = attachHelpers(main_scene);
    main_scene = attachAmbientLight(main_scene);
    setupMainScene2();


    requestAnimationFrame( render );
}




function setupMainScene2(){

    // テクスチャとしてマッピングする
    const main_material = new THREE.MeshStandardMaterial({
        color: 0xFF3399
    })

    const font = fontLoader.load('../fonts/Madimi One_Regular.json',
        function ( font ) {
            // do something with the font
            console.log(font)
            const textGeometry = new TextGeometry('Hello,Three.js!', {
                font: font,
                size: 1.5,
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
                // map: rt.texture,
                color: 0xFF3399
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

}


function render(time){
    requestAnimationFrame( render );
    // console.log('fn render')
    time *= 0.001;

    if ( resizeRendererToDisplaySize( main_renderer ) ) {
        const canvas = main_renderer.domElement;
        main_camera.aspect = canvas.clientWidth / canvas.clientHeight;
        main_camera.updateProjectionMatrix();
    }

    main_renderer.render( main_scene, main_camera );
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

