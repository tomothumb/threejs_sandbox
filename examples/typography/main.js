import * as THREE from 'three';
import {OrbitControls} from "three/addons/controls/OrbitControls";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import {attachAmbientLight, attachCamera, attachHelpers, attachRenderer, attachScene} from "../common_lib/three_util";
const fontLoader = new FontLoader();

let main_camera, main_scene, main_renderer;
const canvas = document.querySelector( '#webgl_canvas' );



// テキスト入力のためのHTML要素を作成
const input = document.createElement('input');
input.type = 'text';
input.placeholder = 'Type something...';
document.body.appendChild(input);

const setting = {
    background_color: 0xEFEFEF,
    camera_fov: 35,
    camera_near : .1,
    camera_far: 1000,

    camera_x: 15,
    camera_y: 10,
    camera_z: 30,

    light_color: 0xFFFFFF,

    message: 'Hello,Three.js!　ハロー日本！',
}

// START: テキスト用のCanvasとThree.jsのPlaneGeometryを作成 //
const text_canvas = document.createElement('canvas');
text_canvas.width = 700;
text_canvas.height = 100;

const text_context = text_canvas.getContext('2d');
const text_texture = new THREE.CanvasTexture(text_canvas);
// CanvasをテクスチャとしてThree.jsで使用
const text_material = new THREE.MeshBasicMaterial({
    map: text_texture,
    // transparent: true
});
// PlaneGeometryのアスペクト比をCanvasと同じに設定
const text_planeGeometry = new THREE.PlaneGeometry(text_canvas.width/30, text_canvas.height/30);

const text_plane = new THREE.Mesh(text_planeGeometry, text_material);
text_plane.position.x = 0;
text_plane.position.y = 5;
text_plane.position.z = 0;

// パーティクルシステムの初期化
// let text_particles;
const text_particles = new THREE.Group();
let particleIndex = 0;

// END

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

    main_scene.add(text_plane);

    loadAndSetupGoogleFont(main_scene);


    requestAnimationFrame( render );
}




async function loadAndSetupGoogleFont(scene){

    main_scene.add(text_particles);


    // GoogleフォントのURLを読み込む

    // const font = new FontFace('KiwiMaru', 'url(https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmWUlfCRc4AMP6lbBP.woff2)');
    await document.fonts.load('20px "Kiwi Maru"');


// Canvasにテキストを描画する関数
    function updateCanvasText(message) {
        // 背景をクリア
        text_context.clearRect(0, 0, text_canvas.width, text_canvas.height);

        // フォントスタイルを設定してテキストを描画
        text_context.font = '40px "Kiwi Maru"';
        text_context.fillStyle = '#0000cc';
        text_context.textAlign = 'center';
        text_context.textBaseline = 'middle';
        // カーニングなし
        text_context.fillText(message, text_canvas.width / 2, text_canvas.height / 2);


        // // カーニングあり
        // let message_x = text_canvas.width / 2 - ( (message.length * 10) + 3); // 初期x位置
        // const message_y = text_canvas.height / 2;
        // const letterSpacing = -3; // 調整する文字詰めの量（負の値で文字を詰める）
        //
        // // 各文字を1文字ずつ描画
        // for (let i = 0; i < message.length; i++) {
        //     text_context.fillText(message[i], message_x, message_y);
        //     message_x += text_context.measureText(message[i]).width + letterSpacing; // 次の文字位置を調整
        // }

        // ピクセルデータを取得
        const text_imageData = text_context.getImageData(0, 0, text_canvas.width, text_canvas.height);
        const { data:text_bitmap_data,width: text_bitmap_width,height: text_bitmap_height } = text_imageData;
        console.log(text_imageData)

        // console.log(text_bitmap_data, text_bitmap_width, text_bitmap_height);
        // パーティクルを操作
        text_particles.clear();

        for (let y = 0; y < text_bitmap_height; y += 1) {  // 1ピクセルごとにスキップ
            for (let x = 0; x < text_bitmap_width; x += 1) {
                const index = (y * text_bitmap_width + x) * 4;
                const alpha = text_bitmap_data[index + 3];            // アルファ値をチェック

                if (alpha >= 128) {                        // 透明度が一定以上のピクセルのみ
                    const particle = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x000000 }));
                    particle.position.set((x - text_bitmap_width/2) / 20 , (text_bitmap_height * 1 - y) / 20 , 0);
                    particle.scale.set(0.04, 0.04, 0.04);   // パーティクルサイズを設定


                    // パーティクルにインデックスを設定し、消えるタイミングを決める
                    particle.disappearDelay = particleIndex * 0.02; // 各パーティクルの遅延時間（先頭から順に遅延）
                    particleIndex++; // インデックスをインクリメント

                    text_particles.add(particle);
                }
            }
        }

        // テクスチャを更新
        text_texture.needsUpdate = true;
    }


    // 入力が変更されたときにパーティクルを更新
    input.addEventListener('input', (event) => {
        const text = event.target.value;
        updateCanvasText(text);
    });
    updateCanvasText(setting.message)
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
            const textGeometry = new TextGeometry(setting.message, {
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

// 重力の加速度を定義
const gravity = 0.001;

function render(time){
    requestAnimationFrame( render );
    // console.log('fn render')
    time *= 0.001;

    if ( resizeRendererToDisplaySize( main_renderer ) ) {
        const canvas = main_renderer.domElement;
        main_camera.aspect = canvas.clientWidth / canvas.clientHeight;
        main_camera.updateProjectionMatrix();
    }


// 各パーティクルに速度プロパティを追加して、初期速度をランダムに設定
    text_particles.children.forEach((particle) => {
        // particle.velocityY = 0; // 垂直方向の速度（初期値0）
        particle.velocityX = (Math.random() - 0.5) * 0.05; // 水平方向の初期速度
        particle.velocityY = (Math.random() - 0.5) * 0.05; // 水平方向の初期速度
    });


    // アニメーションでリアルな重力を再現
    text_particles.children.forEach((particle) => {
        // 垂直方向の速度に重力加速度を加算
        // particle.velocityY -= gravity;

        // パーティクルの位置を更新
        particle.position.x += particle.velocityX; // 水平方向の動き
        particle.position.y -= 0.0005 - particle.velocityY; // 垂直方向の動き

        // 透明度を徐々に減少させる
        particle.material.opacity -= 0.015;

        // 透明度が0以下になったらシーンから削除
        if (particle.material.opacity <= 0) {
            text_particles.remove(particle);
        }
    });

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

