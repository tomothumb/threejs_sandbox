import * as THREE from 'three';

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

// 初期化
function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );


    // カメラを作成
    camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    // シーンを作成
    scene = new THREE.Scene();

    // レンダラーを作成
    renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setPixelRatio(window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );


    // パーティクルの個数
    const numParticles = AMOUNTX * AMOUNTY;

    // 頂点情報を格納する配列
    const positions = new Float32Array( numParticles * 2 );
    // 頂点のスケールを格納する配列
    const scales = new Float32Array( numParticles );

    let i = 0, j = 0;
    for(let ix=0; ix<AMOUNTX; ix++) {
        for(let iy=0; iy<AMOUNTY; iy++) {

            positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); // x
            positions[i + 1] = 0; //y
            positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2) // z
            scales[j] = 1;
            i += 3;
            j++;
        }
    }

    // 頂点情報を格納するバッファジオメトリを作成
    const geometry = new THREE.BufferGeometry();
    // 頂点の位置情報
    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    // 頂点のスケール情報
    geometry.setAttribute('scale', new THREE.BufferAttribute( scales, 1));

    // マテリアルを作成
    const material = new THREE.ShaderMaterial( {
        uniforms: {
            color: { value: new THREE.Color( 0xffffff ) },
        },
        // 頂点シェーダ
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        // フラグメントシェーダ
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
    });

    particles = new THREE.Points( geometry, material );
    scene.add( particles );


    // マウスイベント
    // container.addEventListener( 'pointermove', onPointerMove );


}

// アニメーション
function animate() {
    requestAnimationFrame( animate );
    render();
    // stats.update();
}

// レンダリング
function render() {

    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( - mouseY - camera.position.y ) * .05;
    camera.lookAt( scene.position );


    const positions = particles.geometry.attributes.position.array;
    const scales = particles.geometry.attributes.scale.array;

    let i = 0, j = 0;
    for(let ix=0; ix<AMOUNTX; ix++) {
        for(let iy=0; iy<AMOUNTY; iy++){
            positions[i+1] = ( Math.sin((ix+count) *0.3) *50) + (Math.sin((iy+count) *0.5) *50 )
            scales[j] = ( Math.sin((ix+count) *0.3) +1)*20 + (Math.sin((iy+count) *0.5) +1 ) *20

            i += 3;
            j ++;
        }
    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.scale.needsUpdate = true;
    renderer.render( scene, camera );

    count += 0.1;

}

function onWindowResize() {}

function onPointerMove( event ) {
    if ( event.isPrimary === false ) return;
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

init();
// animate();
render();
