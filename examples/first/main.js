import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer({antialias: false});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// カメラを作成
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
// カメラの位置を設定
camera.position.set( 0, 0, 100 );
camera.position.z = 20;
// カメラの向きを設定
camera.lookAt( 0, 0, 0 );


// シーンを作成
const scene = new THREE.Scene();

// 環境光源を作成
const material_baseline = new THREE.LineBasicMaterial( { color: 0xff00ff } );
const material_subline = new THREE.LineBasicMaterial( { color: 0x999999 } );


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



const geometry_cube = new THREE.BoxGeometry( 10, 10, 10 );
const material_cube = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry_cube, material_cube );
scene.add( cube );



function animate() {
    requestAnimationFrame( animate );

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render( scene, camera );
}

animate();