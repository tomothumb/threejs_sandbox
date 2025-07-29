/**
 */
import * as THREE from 'three';

// ドラッグできるようにする
import {OrbitControls} from "three/addons/controls/OrbitControls";
import {TextGeometry} from "three/addons/geometries/TextGeometry";
import {FontLoader} from "three/addons/loaders/FontLoader";
const fontLoader = new FontLoader();

////////
let main_camera, main_scene, main_renderer;
let main_meshes = [];
let jsonData = []; // ロードされたJSONデータを格納

// 総スクロール量
let totalScroll = 0;

// デバッグテキスト用のオブジェクト
let loadedFont = null; // グローバル変数にフォントを保持
let debugTextMesh;
let textPosition = {
    x: 25, y: 0, z: 27
}
const GAP_CIRCLE = 40;
const NUMBER_OF_ITEM = 10
const BUFFER_DISTANCE = GAP_CIRCLE * NUMBER_OF_ITEM * 2; // 先読みする距離

// 現在の色と目標の色
let currentColor = { h: 0, s: 100, l: 50 }; // 初期の色（HSL）
let targetColor = getRandomColor(); // ゴールとなる色
const canvas = document.querySelector( '#webgl_canvas' );

// マウスコントローラー
const mousePosition = new THREE.Vector2();
window.addEventListener('mousemove', (e) => {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1
});


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
    setupLight();
    setupFog();
    setupHelpers();
    setupDebugger();

    setupFont();
    setupMain();

    requestAnimationFrame( render );
}



function setupLight() {
}


function setupDebugger(){
}

// 平面ジオメトリを更新する関数
function setupMain() {
    // addMeshes(0); // 初期位置に4つのメッシュを追加
    loadJsonAndAddMeshes(0); // 初期のメッシュを生成
}


// 色をランダムに生成する関数（HSL形式）
function getRandomColor() {
    return {
        h: Math.random() * 360, // 色相（0～360度）
        s: 60 + Math.random() * 40, // 彩度（60～100%）
        l: 40 + Math.random() * 20, // 輝度（40～60%）
    };
}

// グラデーションで色を近づける関数
function lerpColor(current, target, t) {
    return {
        h: current.h + (target.h - current.h) * t, // 色相を徐々に近づける
        s: current.s + (target.s - current.s) * t, // 彩度を徐々に近づける
        l: current.l + (target.l - current.l) * t, // 輝度を徐々に近づける
    };
}

const v_radius = 600; // 円の半径（お好みで変更）
const mes = []
const mes2 = []

function addMeshes(baseZ, data) {

    for (let deg = 0; deg < 30; deg++) {
        const angleDeg = deg * 12; // 各メッシュの初期角度（度）

        // 度をラジアンに変換（Math.PI / 180）
        const rad = THREE.MathUtils.degToRad(angleDeg);
        // 円周上の位置を計算
        const x = 0;
        const y = Math.cos(rad) * v_radius + v_radius;
        const z = Math.sin(rad) * v_radius;
        const ma = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const ge = new THREE.CircleGeometry(12, 36, 1); // 例として立方体のジオメトリ

        // メッシュの作成と位置の設定
        const me = new THREE.Mesh(ge, ma);
        me.position.set(x, y, z); // y座標は0に設定（必要に応じて変更）
        me.userData.angle = angleDeg;

        // シーンに追加
        mes.push(me)
        main_scene.add(me);
    }

    for (let deg = 0; deg < 360; deg++) {
        const angleDeg = deg * 1; // 各メッシュの初期角度（度）

        // 度をラジアンに変換（Math.PI / 180）
        const rad = THREE.MathUtils.degToRad(angleDeg);
        // 円周上の位置を計算
        const x = 0;
        const y = Math.cos(rad) * v_radius + v_radius;
        const z = Math.sin(rad) * v_radius;
        const ma = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const ge = new THREE.CircleGeometry(12, 36, 1); // 例として立方体のジオメトリ

        // メッシュの作成と位置の設定
        const me = new THREE.Mesh(ge, ma);
        me.position.set(x, y, z); // y座標は0に設定（必要に応じて変更）
        me.userData.angle = angleDeg;

        // シーンに追加
        mes.push(me)
        main_scene.add(me);
    }


    // data.forEach((item, index) => {
    //     // 現在の色を更新（ゴールに向かって少しずつ近づく）
    //     currentColor = lerpColor(currentColor, targetColor, 0.1);
    //
    //     // ゴールの色に近づいたら新しいゴールを設定
    //     if (Math.abs(currentColor.h - targetColor.h) < 1 &&
    //         Math.abs(currentColor.s - targetColor.s) < 1 &&
    //         Math.abs(currentColor.l - targetColor.l) < 1) {
    //         targetColor = getRandomColor(); // 新しいゴールを設定
    //     }
    //
    //     // HSLで色を生成
    //     const materialColor = new THREE.Color(`hsl(${currentColor.h % 360}, ${currentColor.s}%, ${currentColor.l}%)`);
    //     const material = new THREE.MeshBasicMaterial({ color: materialColor });
    //
    //     const circle_size = 7 + Math.random() * 3; // 7～10
    //     const geometry = new THREE.CircleGeometry(circle_size, 50, 10);
    //
    //     const mesh = new THREE.Mesh(geometry, material);
    //
    //     mesh.position.set(0, 0, baseZ - index * GAP_CIRCLE); // z座標をずらして配置
    //     main_meshes.push(mesh);
    //     main_scene.add(mesh);
    //
    //     // テキストスプライトを追加
    //     addTextSprite(item, mesh.position);
    // });
}

// テキストスプライトを追加する関数
function addTextSprite(item, position) {
    const text = item.title;
    const description = item.description;


    const textGeometry = new TextGeometry(text, {
        font: loadedFont,
        size: 1.2,
        height: 0,
    });

    const descGeometry = new TextGeometry(description, {
        font: loadedFont,
        size: 0.5,
        height: 0,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const titleMesh = new THREE.Mesh(textGeometry, textMaterial);
    titleMesh.position.set(position.x + 12, position.y + 2 , position.z); // テキストの位置を再設定
    main_scene.add(titleMesh);

    const descMesh = new THREE.Mesh(descGeometry, textMaterial);
    descMesh.position.set(position.x + 12, position.y -0 , position.z); // テキストの位置を再設定
    main_scene.add(descMesh);

}



// 現在のカメラ位置を基にメッシュを先読み
function checkAndAddMeshes() {
    const cameraZ = main_camera.position.z; // カメラの現在のz座標
    const lastMeshZ = main_meshes[main_meshes.length - 1]?.position.z || 0;

    // カメラ位置が最後のメッシュの近くになったら新しいメッシュを生成
    // if (cameraZ < lastMeshZ + BUFFER_DISTANCE) {
    //     loadJsonAndAddMeshes(lastMeshZ - GAP_CIRCLE);
    // }
}


function setupFont(){
    // フォント

    fontLoader.load('../fonts/Madimi One_Regular.json',
        function ( font ) {
            loadedFont = font
            // do something with the font
            console.log(loadedFont)
            const textGeometry = new TextGeometry('0.00', {
                font: loadedFont,
                size: 1.0,
                height: 0,
            });
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
            debugTextMesh = new THREE.Mesh(textGeometry, textMaterial);
            debugTextMesh.position.set(textPosition.x, textPosition.y, textPosition.z); // テキストの位置を再設定
            main_scene.add(debugTextMesh);
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




function setupRenderer() {
    // レンダラ
    main_renderer = new THREE.WebGLRenderer({antialias: true, canvas});
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
    main_camera.position.set( 15,15, 50);
    main_camera.lookAt( 15, 15, 0 );
    // main_camera.lookAt( 0, 0, 0 );
    // const orbit = new OrbitControls(main_camera, canvas);
    // orbit.update();
}

function setupScene(){
    // シーン
    main_scene = new THREE.Scene();
    main_scene.background = new THREE.Color(_SETTING.BG_COLOR);
}



// let step = 0;
function render(){
    requestAnimationFrame( render );

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
        // main_camera.aspect = window.innerWidth / window.innerHeight;
        // main_camera.updateProjectionMatrix();
    }
    return needResize;
}

init();



function setupFog() {
    // フォグ
    main_scene.fog = new THREE.FogExp2(0xFFFFFF, 0.005);
}

function setupHelpers(){

    // グリッドヘルパー
    const gridHelper = new THREE.GridHelper( 100, 50 );
    main_scene.add( gridHelper );

    // 軸ヘルパー
    const axesHelper = new THREE.AxesHelper( 100 );
    main_scene.add( axesHelper );
}

let zoomSpeed = 0.05; // ズームの速度

// main_cube.position.z += delta;


window.addEventListener('wheel', (event) => {
    event.preventDefault(); // 通常のスクロール動作を防止
    const delta = event.deltaY * zoomSpeed;

    // 総スクロール量を更新
    totalScroll += delta;
    // console.log(totalScroll.toFixed(2))

    // main_camera.position.z += delta;
    main_meshes.forEach(mesh => mesh.position.z -= delta);

    mes.forEach((mesh) => {
        // mesh.position.z -= delta
        mesh.userData.angle += delta / 5;
        // 更新された角度をラジアンに変換
        const rad = THREE.MathUtils.degToRad(mesh.userData.angle);
        // 円周上の新しい位置を計算してセット
        // mesh.position.x = Math.cos(rad) * v_radius;
        mesh.position.x = 0;
        mesh.position.y = Math.cos(rad) * v_radius + v_radius;
        mesh.position.z = Math.sin(rad) * v_radius;
    });

    // デバッグテキストを更新
    if (debugTextMesh) {
        main_scene.remove(debugTextMesh); // 古いテキストを削除

        const textGeometry = new TextGeometry(`${totalScroll.toFixed(2)}`, {
            font: loadedFont,
            size: 1.0,
            height: 0,
        });

        debugTextMesh.geometry.dispose(); // 古いジオメトリを破棄
        debugTextMesh = new THREE.Mesh(textGeometry, debugTextMesh.material); // 新しいテキストを作成
        // textPosition.z += delta;
        debugTextMesh.position.set(textPosition.x, textPosition.y, textPosition.z); // テキストの位置を再設定
        main_scene.add(debugTextMesh);
    }

    // メッシュを先読み
    checkAndAddMeshes();

    // render();
}, { passive: false });


// JSONをロードしてからメッシュを追加する関数
async function loadJsonAndAddMeshes(baseZ) {
    if (jsonData.length === 0) {
        try {
            // JSONデータをロード
            const response = await fetch('./dynamic_loading.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            jsonData = await response.json(); // JSONデータを配列に格納
        } catch (error) {
            console.error('Error loading JSON:', error);
            return;
        }
    }

    // JSONデータを使ってメッシュを生成
    addMeshes(baseZ, jsonData);
}