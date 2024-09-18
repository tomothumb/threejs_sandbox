/**
 * 3Dモデルの形式
 * ・Webで表示する場合：GLB形式、GLTF形式
 * ・iOSのsafariで動かす場合：USDZ形式
 *
 * https://chatgpt.com/share/0349e1ab-47e7-4ca7-99a2-1fecfa61513e?fbclid=IwZXh0bgNhZW0CMTEAAR1J7JdUd5zMbgkV6KmOkpjbzTJygqMFHLql9ezf1CCs9d3q19ze6YJDJbs_aem_eJzinIIXY7V-06bnXzHoPQ
 */
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // シャドウマップを有効化
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // シャドウのソフトネスを設定
document.getElementById('canvas-container').appendChild(renderer.domElement);

// シャドウの有効化
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 照明の追加
const ambientLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientLight);


// スポットライトの追加
const spotLight = new THREE.SpotLight(0xFFCC66, 10); // スポットライトの色と強度を設定
spotLight.position.set(-1000, 2000, 1000); // スポットライトの位置
spotLight.castShadow = true; // スポットライトがシャドウをキャストするように設定
spotLight.angle = Math.PI / 6; // スポットライトの照射角度
spotLight.penumbra = 0.2; // スポットライトのぼやけ具合
spotLight.decay = 0.01; // 光の減衰
spotLight.distance = 3000; // 光の最大距離
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 0.5;
spotLight.shadow.camera.far = 1000;
scene.add(spotLight);

// スポットライトのガイドを追加
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

// GLTFLoaderの設定とモデルの読み込み
const loader = new GLTFLoader();
loader.load(
    './assets/bed.glb',
    (gltf) => {
        const model = gltf.scene;
        model.scale.set(1, 1, 1); // モデルのスケールを調整
        model.position.set(0, 330, 0); // モデルの位置をシーンの中心に設定

        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true; // モデルがシャドウを落とすように設定
                node.receiveShadow = true; // 必要に応じてシャドウを受け取る
            }
        });
        scene.add(model);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the GLB model:', error);
    }
);


// 地面の追加
const planeGeometry = new THREE.PlaneGeometry(10000, 10000);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xBBBBBB }); // 肌色のマテリアル
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // 地面を水平に設定
plane.receiveShadow = true; // 地面がシャドウを受けるように設定
scene.add(plane);

// カメラの位置をさらに後方かつ上から見下ろすように調整
camera.position.set(1300, 1300, 1300); // X, Y, Z座標でカメラ位置を指定
camera.lookAt(0, 0, 0); // シーンの中心を見つめるように設定

// コントロールの設定（ズーム、パン、回転）
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;


// // XYZ軸の表示
// const axesHelper = new THREE.AxesHelper(2000); // 長さ10の軸を表示
// scene.add(axesHelper);
// // グリッドヘルパーの追加
// const gridHelper = new THREE.GridHelper(2500, 10, 0x000000, 0x808080); // グリッドのカラー調整
// scene.add(gridHelper);

// ウィンドウのリサイズ対応
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    spotLightHelper.update(); // スポットライトのガイドを更新
    renderer.setClearColor(0xffffff, 1); // 背景色を白に設定
    renderer.render(scene, camera);
}

animate();
