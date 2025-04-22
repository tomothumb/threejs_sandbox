import * as THREE from 'three';
import {OrbitControls} from "three/addons/controls/OrbitControls";
import {attachAmbientLight, attachCamera, attachHelpers, attachRenderer, attachScene} from "../common_lib/three_util";
import {
    AnalogousSchemeStrategy,
    ColorGenerator,
    ComplementarySchemeStrategy,
    TriadSchemeStrategy
} from "../common_lib/color_util";
import {ArcAnimationController} from "../common_lib/animation_util";

let main_camera, main_scene, main_renderer;
const main_canvas = document.querySelector( '#webgl_canvas' );

let arcAnimationController;
let arcProps;
let arcObjects;

const setting = {
    background_color: 0xEFEFEF,
    camera_fov: 75,
    camera_near : .1,
    camera_far: 1000,

    camera_x: 10,
    camera_y: 10,
    camera_z: 30,

    light_color: 0xFFFFFF,
}



function init(){
    console.log('fn init')

    main_renderer = attachRenderer(main_canvas);
    main_scene = attachScene(setting.background_color);
    main_camera = attachCamera(setting, main_canvas);
    // const orbit = new OrbitControls(main_camera, main_canvas);
    // orbit.update();

    main_scene = attachHelpers(main_scene);
    main_scene = attachAmbientLight(main_scene);

    // n個の円弧を生成
    arcProps = generateArcData(400);
    arcAnimationController = new ArcAnimationController(arcProps);

    // 円弧のジオメトリとマテリアルを作成
    arcObjects = arcProps.map(arc => {
        // ここで円弧のメッシュを作成
        return createArc(
            arc.radius,
            arc.start,
            arc.end,
            arc.color,
            arc.thickness
        );
    });

    arcObjects.forEach(obj => {
        main_scene.add(obj)
    });

    requestAnimationFrame( render );
}


// 重力の加速度を定義

function render(time){
    requestAnimationFrame( render );

    // 円弧のアニメーションを更新
    arcAnimationController.update();

    // 各円弧のメッシュを更新
    arcObjects.forEach((mesh, index) => {
        const arc = arcProps[index];
        // console.log(mesh, arc);
        updateArcRotation(mesh, arc);
    });


    if ( resizeRendererToDisplaySize( main_renderer ) ) {
        const main_canvas = main_renderer.domElement;
        main_camera.aspect = main_canvas.clientWidth / main_canvas.clientHeight;
        main_camera.updateProjectionMatrix();
    }

    main_renderer.render( main_scene, main_camera );
}


function resizeRendererToDisplaySize( renderer ) {

    const main_canvas = renderer.domElement;
    const width = main_canvas.clientWidth;
    const height = main_canvas.clientHeight;
    const needResize = main_canvas.width !== width || main_canvas.height !== height;
    if ( needResize ) {
        renderer.setSize( width, height, false );
    }
    return needResize;
}

init();


// 円弧を作成する関数を修正
function createArc(radius, startAngle, endAngle, color, thickness) {
    // 外側と内側の円弧を作成するためのShape
    const arc_shape = new THREE.Shape();

    // 円弧の点を計算する関数
    const getArcPoint = (angle, rad) => ({
        x: Math.cos(angle) * rad,
        y: Math.sin(angle) * rad
    });

    // 外側の円弧の開始点
    const outerStart = getArcPoint(startAngle, radius + thickness/2);
    arc_shape.moveTo(outerStart.x, outerStart.y);

    // 外側の円弧を描く
    for (let angle = startAngle; angle <= endAngle; angle += 0.01) {
        const point = getArcPoint(angle, radius + thickness/2);
        arc_shape.lineTo(point.x, point.y);
    }

    // 内側の円弧を逆向きに描く
    for (let angle = endAngle; angle >= startAngle; angle -= 0.01) {
        const point = getArcPoint(angle, radius - thickness/2);
        arc_shape.lineTo(point.x, point.y);
    }

    // シェイプを閉じる
    arc_shape.closePath();

    // ジオメトリとマテリアルを作成
    const arc_geometry = new THREE.ShapeGeometry(arc_shape);
    const arc_material = new THREE.MeshBasicMaterial({
        color: color,
        // side: THREE.DoubleSide
    });

    return new THREE.Mesh(arc_geometry, arc_material);
}





// 指定範囲内のランダムな数値を生成する関数
function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

// 円弧のパラメータを生成する関数
function generateArcData(count) {
    const arcProps = [];
    const minRadius = 15.0;
    const radiusStep = 0.15;
    const minArcLength = Math.PI * (60/180);  // 15度
    const maxArcLength = Math.PI * (120/180);  // 60度
    const minThickness = 0.1;
    const maxThickness = 0.4;
    // 回転速度のパラメータ
    const minRotationSpeed = 0.1;  // 1回転あたり最小10秒
    const maxRotationSpeed = 0.5;  // 1回転あたり最小2秒


    const colorGen = new ColorGenerator(0.025) // エンジ色をベース
            // .setMainStrategy(new ComplementarySchemeStrategy())
            // .setMainStrategy(new TriadSchemeStrategy())
        .setMainStrategy(new AnalogousSchemeStrategy({
            analogousRange: 0.1,
            saturation: { min: 0.6, max: 0.9 },
            lightness: { min: 0.5, max: 0.8 }
        }))
    ;
    const colors = colorGen.generateColorScheme(count);


    for (let i = 0; i < count; i++) {
        // 円弧の長さをランダムに決定
        const arcLength = getRandomFloat(minArcLength, maxArcLength);
        // 開始角度をランダムに決定（0から2πの間）
        const startAngle = getRandomFloat(0, Math.PI * 2);
        // 線の太さをランダムに決定
        const thickness = getRandomFloat(minThickness, maxThickness);
        // 回転方向をランダムに決定（1 or -1）
        const rotationDirection = Math.random() > 0.5 ? 1 : -1;

        const arc = {
            radius: minRadius + (i * radiusStep),  // 半径を段階的に大きくする
            start: startAngle,
            end: startAngle + arcLength,
            // color: getRandomColor(),
            color: colors[i],
            thickness: thickness,  // 太さの情報を追加
            // アニメーション用のパラメータを追加
            rotation: {
                speed: rotationDirection * getRandomFloat(minRotationSpeed, maxRotationSpeed),
                current: 0 // 現在の回転角度
            }

        };

        arcProps.push(arc);
    }

    return arcProps;
}




// 円弧のジオメトリを更新する関数
function updateArcGeometry(mesh, arc) {
    // 既存の円弧ジオメトリ更新ロジック
    const curve = new THREE.EllipseCurve(
        0, 0,                                     // 中心のx, y
        arc.radius, arc.radius,                   // x半径, y半径
        arc.currentStart, arc.currentEnd,         // 開始角度、終了角度
        false,                                    // 時計回りかどうか
        0                                         // 回転角度
    );

    const points = curve.getPoints(50);

    // 更新フラグを設定
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // // メッシュの位置を更新
    mesh.geometry.dispose();
    mesh.geometry = geometry;
}


function createArcGeometry(arc) {
    const curve = new THREE.EllipseCurve(
        0, 0,                           // 中心のx, y
        arc.radius, arc.radius,         // x半径, y半径
        arc.start, arc.end,            // 開始角度、終了角度
        false,                          // 時計回りかどうか
        0                              // 回転角度
    );

    const points = curve.getPoints(50);
    return new THREE.BufferGeometry().setFromPoints(points);
}

// アニメーション更新用の関数
function updateArcRotation(mesh, arc) {
    // メッシュの回転を直接更新
    mesh.rotation.z = arc.rotation.current;
}








