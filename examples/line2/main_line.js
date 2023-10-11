import * as THREE from 'three';
console.log(1)
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



// 環境光源を作成
const material_baseline = new THREE.LineBasicMaterial( { color: 0xff00ff } );
const material_subline = new THREE.LineBasicMaterial( { color: 0x999999 } );



// X軸にを引く
function drawHorizontalLine(y_pos, material) {
    const line_points = [];
    line_points.push( new THREE.Vector3( - 10, y_pos, 0 ) );
    line_points.push( new THREE.Vector3( 10, y_pos, 0 ) );
    drowLine(line_points, material)
}

// Y軸にを引く
function drawVerticalLine(x_pos, material) {
    const line_points = [];
    line_points.push( new THREE.Vector3( x_pos,- 10, 0 ) );
    line_points.push( new THREE.Vector3( x_pos,10, 0 ) );
    drowLine(line_points, material)

}
function drowLine(line_points, material){
    const geometry = new THREE.BufferGeometry().setFromPoints( line_points );
    const line = new THREE.Line( geometry, material );
    scene.add( line );
}



// 初期化
function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );


    // カメラを作成
    camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 10000 );
    // camera.position.z = 1000;
    camera.position.set( 0, 0, 20 );
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




// 基準線を引く
    drawHorizontalLine(0, material_baseline);
    drawVerticalLine(0, material_baseline);
// サブの線を引く
    for(let i=1; i<10; i++) {
        drawHorizontalLine(i, material_subline);
        drawHorizontalLine(-i, material_subline);
        drawVerticalLine(i, material_subline);
        drawVerticalLine(-i, material_subline);
    }

}

// アニメーション
function animate() {
    requestAnimationFrame( animate );
    render();
    // stats.update();
}

// レンダリング
function render() {

    // camera.position.x += ( mouseX - camera.position.x ) * .05;
    // camera.position.y += ( - mouseY - camera.position.y ) * .05;
    // camera.lookAt( scene.position );

    const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3( -10, 0, 0 ),
        new THREE.Vector3( 20, 5 +count, 0 ),
        new THREE.Vector3( 10, 0, 0 )
    );

    const curve_points = curve.getPoints( 50 );
    const curve_geometry = new THREE.BufferGeometry().setFromPoints( curve_points );


    const curve_material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    const curve_object = new THREE.Line( curve_geometry, curve_material );
    scene.add(curve_object);

    // curve_geometry.attributes.position.needsUpdate = true;
    // curve_geometry.attributes.scale.needsUpdate = true;
    renderer.render( scene, camera );

    count += 0.3;

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
