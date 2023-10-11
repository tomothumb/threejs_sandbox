import * as THREE from 'three';
import perlin from 'perlin-noise';

let frame = 0;

// パラメタ
const SEPARATION = 100;
// X軸方向の個数
const AMOUNTX = 50;
// Y軸方向の個数
const AMOUNTY = 50;

let container;
let camera, scene, renderer;
let particles = 0;
let count = 0;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2; // 画面の中心X
let windowHalfY = window.innerHeight / 2; // 画面の中心Y
let draw_start = 0, draw_step = 2;
let wave;
let wave2;
let wave3;
const pointNum = 20;

const noiseArray = perlin.generatePerlinNoise(AMOUNTX, AMOUNTY);


// 環境光源を作成
const material_baseline = new THREE.LineBasicMaterial( { color: 0xff00ff } );
const material_subline = new THREE.LineBasicMaterial( { color: 0x999999 } );



// X軸にを引く
function drawHorizontalLine(y_pos, material) {
    const line_points = [];
    line_points.push( new THREE.Vector3( - 20, y_pos, 0 ) );
    line_points.push( new THREE.Vector3( 20, y_pos, 0 ) );
    drowLine(line_points, material)
}

// Y軸にを引く
function drawVerticalLine(x_pos, material) {
    const line_points = [];
    line_points.push( new THREE.Vector3( x_pos,- 20, 0 ) );
    line_points.push( new THREE.Vector3( x_pos,20, 0 ) );
    drowLine(line_points, material)

}
function drowLine(line_points, material){
    const geometry = new THREE.BufferGeometry().setFromPoints( line_points );
    const line = new THREE.Line( geometry, material );
    scene.add( line );
}

function drawGrids(){


// 基準線を引く
    drawHorizontalLine(0, material_baseline);
    drawVerticalLine(0, material_baseline);
// サブの線を引く
    for(let i=1; i<20; i++) {
        drawHorizontalLine(i, material_subline);
        drawHorizontalLine(-i, material_subline);
        drawVerticalLine(i, material_subline);
        drawVerticalLine(-i, material_subline);
    }
}


// 初期化
function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );


    // カメラを作成
    camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 10000 );
    // camera.position.z = 1000;
    camera.position.set( 0, 0, 30 );
    camera.lookAt( 0, 0, 0 );


    // シーンを作成
    scene = new THREE.Scene();

    // レンダラーを作成
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    })

    renderer.setPixelRatio(window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    // グリッドの表示
    drawGrids();

    createWave()

}

// アニメーション
function animate() {
    requestAnimationFrame( animate );

    // フレーム数をインクリメント
    frame++;

    // フレーム数が２で割り切れなければ描画しない
    if (frame % 4 != 0) {
        return;
    }

    render();
    // stats.update();
}

// レンダリング
function render() {

    // camera.position.x += ( mouseX - camera.position.x ) * .05;
    // camera.position.y += ( - mouseY - camera.position.y ) * .05;
    // camera.lookAt( scene.position );

    drawLine();

    // curve_geometry.attributes.position.needsUpdate = true;
    // curve_geometry.attributes.scale.needsUpdate = true;
    renderer.render( scene, camera );

    count += 0.3;

}


function createWave() {
    const points = [];
    const points2 = [];
    const points3 = [];
    // for (let i = 0; i < pointNum; i++) {
    //     const x = i;
    //     const y = i;
    //     const z = 0;
    //     const p = new THREE.Vector3(x, y, z);
    //     points.push(p);
    // }
    for (let i = 0; i < pointNum; i++) {
        const x = i;

        const rad = degToRad(360 / pointNum * i);
        const y = 5 * Math.sin(rad);
        // const yOffset = noiseArray[x]*20;
        // console.log(yOffset)
        const yOffset = 0;

        const z = 0;
        const p = new THREE.Vector3(x, y+yOffset, z);
        points.push(p);
    }
    for (let i = 0; i < pointNum; i++) {
        const x = i;

        const rad = degToRad(360 / pointNum * i);
        const y = -0.5 +(5 * Math.sin(rad));

        const z = 0;
        const p = new THREE.Vector3(x, y, z);
        points2.push(p);
    }
    for (let i = 0; i < pointNum; i++) {
        const x = i;

        const rad = degToRad(360 / pointNum * i);
        const y = -1 +(5 * Math.sin(rad));

        const z = 0;
        const p = new THREE.Vector3(x, y, z);
        points3.push(p);
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const geo2 = new THREE.BufferGeometry().setFromPoints(points2);
    const geo3 = new THREE.BufferGeometry().setFromPoints(points3);
    const mat = new THREE.LineBasicMaterial({color: 0xff0000});
    const mat2 = new THREE.LineBasicMaterial({color: 0x00cc00});
    const mat3 = new THREE.LineBasicMaterial({color: 0x00000ff});
    wave = new THREE.Line(geo, mat);
    scene.add(wave);
    wave2 = new THREE.Line(geo2, mat2);
    scene.add(wave2);
    wave3 = new THREE.Line(geo3, mat3);
    scene.add(wave3);
}

function drawLine() {
    wave.geometry.setDrawRange(draw_start, draw_step);
    wave2.geometry.setDrawRange(draw_start-3, draw_step-3);
    wave3.geometry.setDrawRange(draw_start-6, draw_step-6);

    draw_step += 1;
    draw_start = draw_step;

    if (count > pointNum / 2) {
        draw_start += 1;
    }
    if (draw_start > pointNum) {
        draw_step = 2;
        draw_start = 0;
    }
}

function onWindowResize() {}

function onPointerMove( event ) {
    if ( event.isPrimary === false ) return;
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

init();
animate();
// render();



function degToRad(deg) {
    return deg * Math.PI / 180;
}