import * as THREE from 'three';

const COLORCHANGE_OFFSET = 200;
const InitialColor=0xEAE5D8;
const s1BaseColor=0xEAE5D8;
const s2BaseColor=0x7A8862;
const s3BaseColor=0xF2F0EE;
const s1Element = document.querySelector('#s1');
const s2Element = document.querySelector('#s2');
const s3Element = document.querySelector('#s3');
const s1InfoElement = document.querySelector('#info_s1');
const s2InfoElement = document.querySelector('#info_s2');
const s3InfoElement = document.querySelector('#info_s3');
const xInfoElement = document.querySelector('#info_x');
const yInfoElement = document.querySelector('#info_y');
const stageInfoElement = document.querySelector('#info_stage');

let s1PositionY = 0;
let s2PositionY = 0;
let s3PositionY = 0;



const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// カメラを作成
const camera = new THREE.PerspectiveCamera( 45, (window.innerWidth) / (window.innerHeight), 5, 40 );
// const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
// カメラの位置を設定
camera.position.set( 0, 0, 100 );
camera.position.z = 10;
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


const geometry_plate = new THREE.PlaneGeometry( 10, 10 );
const material_plate = new THREE.MeshBasicMaterial( {color: 0xEAE5D8, side: THREE.DoubleSide} );
const plate = new THREE.Mesh( geometry_plate, material_plate );
scene.add( plate );




let prev_scrollY = 0;

function animate() {
    requestAnimationFrame( animate );

    if(scrollY != prev_scrollY){
        prev_scrollY = scrollY
        plate.material.color.setHex(getPlateColorCode());
    }

    // cube.rotation.x += 0.001;
    // cube.rotation.y += 0.001;

    renderer.render( scene, camera );
}

animate();





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


function updatePosition() {
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // 画面最下部にエレメントが到達したら0を示す
    s1PositionY = s1Element.getBoundingClientRect().top - window.innerHeight;
    s2PositionY = s2Element.getBoundingClientRect().top - window.innerHeight;
    s3PositionY = s3Element.getBoundingClientRect().top - window.innerHeight;

    // 取得したYポジションをinfoElementに出力します
    s1InfoElement.textContent = s1PositionY;
    s2InfoElement.textContent = s2PositionY;
    s3InfoElement.textContent = s3PositionY;
    xInfoElement.textContent = scrollX;
    yInfoElement.textContent = scrollY;

    stageInfoElement.textContent = getStageLabel();

}



function getPlateColorCode(){

    if(getStageLabel() === "FINISH_S1"){
        return s1BaseColor;
    }else if(getStageLabel() === "FINISH_S2"){
        return s2BaseColor;
    }else if(getStageLabel() === "FINISH_S3"){
        return s3BaseColor;
    }else if(getStageLabel() === "START_S1"){
        let current_progress_position = - (s1PositionY - COLORCHANGE_OFFSET);
        let progress =  current_progress_position / (COLORCHANGE_OFFSET * 2) * 100
        return getColorForPercentage(InitialColor, s1BaseColor, progress);
    }else if(getStageLabel() === "START_S2"){
        let current_progress_position = - (s2PositionY - COLORCHANGE_OFFSET);
        let progress =  current_progress_position / (COLORCHANGE_OFFSET * 2) * 100
        return getColorForPercentage(s1BaseColor, s2BaseColor, progress);
    }else if(getStageLabel() === "START_S3"){
        let current_progress_position = - (s3PositionY - COLORCHANGE_OFFSET);
        let progress =  current_progress_position / (COLORCHANGE_OFFSET * 2) * 100
        return getColorForPercentage(s2BaseColor, s3BaseColor, progress);
    }
    return InitialColor;
}


function lerp(start, end, fraction) {
    return start + (end - start) * fraction;
}

// 2つのカラー間で補間
function interpolateColor(color1, color2, fraction) {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;

    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;

    const r = Math.round(lerp(r1, r2, fraction));
    const g = Math.round(lerp(g1, g2, fraction));
    const b = Math.round(lerp(b1, b2, fraction));

    return (r << 16) | (g << 8) | b;
}

function getColorForPercentage(startColor, endColor, percentage) {
    const fraction = percentage / 100;
    const interpolatedColor = interpolateColor(startColor, endColor, fraction);
    return '0x' + interpolatedColor.toString(16).padStart(6, '0');
}


function getStageLabel(){
    if(s3PositionY + COLORCHANGE_OFFSET < 0) {
        return 'FINISH_S3';
    }else if(s3PositionY - COLORCHANGE_OFFSET < 0){
        return 'START_S3';
    }else if(s2PositionY + COLORCHANGE_OFFSET < 0) {
        return 'FINISH_S2';
    }else if(s2PositionY - COLORCHANGE_OFFSET < 0){
        return 'START_S2';
    }else if(s1PositionY + COLORCHANGE_OFFSET < 0) {
        return 'FINISH_S1';
    }else if(s1PositionY - COLORCHANGE_OFFSET < 0){
        return 'START_S1';
    }

    return 'START_S1'
}


// DOMが読み込まれた後、またはウィンドウサイズが変更されたときにupdatePosition関数を呼び出します
window.addEventListener('DOMContentLoaded', updatePosition);
window.addEventListener('scroll', updatePosition);
window.addEventListener('resize', updatePosition);


