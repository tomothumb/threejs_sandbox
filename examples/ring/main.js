import * as THREE from 'three';
import {OrbitControls} from "three/addons/controls/OrbitControls";
import {attachAmbientLight, attachCamera, attachHelpers, attachRenderer, attachScene} from "../common_lib/three_util";
import {AnalogousSchemeStrategy, ColorGenerator} from "../common_lib/color_util";

let main_camera, main_scene, main_renderer;
const main_canvas = document.querySelector( '#webgl_canvas' );

let data_arcs;

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
    const data_arcs = generateArcData(100);
    // const data_arcs = generateStructuredArcs(100);

    // 円弧を作成してシーンに追加
    data_arcs.forEach(arc => {
        const arc_obj = createArc(
            arc.radius,
            arc.start,
            arc.end,
            arc.color,
            arc.thickness
        );
        main_scene.add(arc_obj);
    });

    requestAnimationFrame( render );
}


// 重力の加速度を定義

function render(time){
    requestAnimationFrame( render );
    // console.log('fn render')
    time *= 0.001;

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
    const data_arcs = [];
    const minRadius = 1.0;
    const radiusStep = 0.2;
    const minArcLength = Math.PI * (15/180);  // 15度
    const maxArcLength = Math.PI * (60/180);  // 60度
    const minThickness = 0.2;
    const maxThickness = 0.8;


    const colorGen = new ColorGenerator(0.025) // エンジ色をベース
        .setMainStrategy(new AnalogousSchemeStrategy({
            analogousRange: 0.1,
            saturation: { min: 0.6, max: 0.9 },
            lightness: { min: 0.5, max: 0.8 }
        }));
    const colors = colorGen.generateColorScheme(count);


    for (let i = 0; i < count; i++) {
        // 円弧の長さをランダムに決定
        const arcLength = getRandomFloat(minArcLength, maxArcLength);
        // 開始角度をランダムに決定（0から2πの間）
        const startAngle = getRandomFloat(0, Math.PI * 2);
        // 線の太さをランダムに決定
        const thickness = getRandomFloat(minThickness, maxThickness);

        const arc = {
            radius: minRadius + (i * radiusStep),  // 半径を段階的に大きくする
            start: startAngle,
            end: startAngle + arcLength,
            // color: getRandomColor(),
            color: colors[i],
            thickness: thickness  // 太さの情報を追加
        };

        data_arcs.push(arc);
    }

    return data_arcs;
}














