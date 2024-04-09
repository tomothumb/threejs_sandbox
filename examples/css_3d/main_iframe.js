/**
 * @refer official example css3d - periodic table.
 * https://threejs.org/examples/#css3d_periodictable
 * original soruce code:
 * https://github.com/mrdoob/three.js/blob/master/examples/css3d_periodictable.html
 */
import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';



const atom_tables = [
    ['H', 'Hydrogen', '1.00794', 1, 1],
    ['He', 'Helium', '4.002602', 18, 1],
    ['Li', 'Lithium', '6.941', 1, 2],
    ['Be', 'Beryllium', '9.012182', 2, 2],
    ['Xx', 'Xxxxxx', '99.99', 3, 2],
    ['Yy', 'Yyyyyy', '99.99', 4, 2],
    ['Zz', 'Zzzzzz', '99.99', 5, 2],
];

let camera, scene, renderer;
let trackball_controll;

const css_3d_objects = [];
const render_targets = {
    type_table: [],
    // sphere: [],
    // helix: [],
    type_grid: []
};

init()
animate()

function init(){
    console.log('fn init')

    // レンダラーを作成
    renderer = new CSS3DRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById( 'container' ).appendChild( renderer.domElement );


    // カメラを作成
    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    // カメラの位置を設定
    // camera.position.set( 0, 0, 100 );
    camera.position.z = 3000;

    // シーンを作成
    scene = new THREE.Scene();

    // set Objects
    for ( let i = 0; i < atom_tables.length; i++ ) {
        const ele = document.createElement( 'div' );
        ele.className = 'element';
        ele.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';

        const number = document.createElement( 'div' );
        number.className = 'number';
        number.textContent = i + 1;
        ele.appendChild( number );

        const symbol = document.createElement( 'div' );
        symbol.className = 'symbol';
        symbol.textContent = atom_tables[i][0];
        ele.appendChild( symbol );

        const details = document.createElement( 'div' );
        details.className = 'details';
        details.innerHTML = atom_tables[i][1] + '<br>' + atom_tables[i][2];
        ele.appendChild( details );

        const iframe = document.createElement( 'iframe' );
        iframe.className = 'iframe';
        iframe.src = "https://socialis.co.jp/"
        ele.appendChild( iframe );


        const objectCSS = new CSS3DObject( ele );
        objectCSS.position.x = Math.random() * 2000 - 1000;
        objectCSS.position.y = Math.random() * 2000 - 1000;
        objectCSS.position.z = Math.random() * 2000 - 1000;
        scene.add( objectCSS );
        css_3d_objects.push( objectCSS );
    }

    // TYPE: Table
    // for ( let i = 0; i < atom_tables.length; i += 5 ) {
    //     const element = document.createElement( 'div' );
    //     element.className = 'element';
    //     element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
    //     const objectCSS = new CSS3DObject( element );
    //     // objectCSS.position.x = Math.random() * 4000 - 2000;
    //     // objectCSS.position.y = Math.random() * 4000 - 2000;
    //     // objectCSS.position.z = Math.random() * 4000 - 2000;
    //     scene.add( objectCSS );
    //     css_3d_objects.push( objectCSS );
    //
    //     // render_targets
    //     const obj = new THREE.Object3D();
    //     // 配置する位置を計算
    //     obj.position.x = ( atom_tables[ i ] * 140 );
    //     obj.position.y = ( atom_tables[ i ] * 180 );
    //
    //     render_targets.type_table.push( obj );
    // }

    // TYPE: Grid
    for ( let i = 0; i < css_3d_objects.length; i++ ) {
        const obj = new THREE.Object3D();
        // 配置する位置を計算
        obj.position.x = i * 200;
        obj.position.y = i * 200;
        obj.position.z = i * 200;
        render_targets.type_grid.push( obj );
    }

    //
    trackball_controll = new TrackballControls( camera, renderer.domElement );
    trackball_controll.minDistance = 500;
    trackball_controll.maxDistance = 6000;
    trackball_controll.addEventListener( 'change', render );


    // 準備ができたのでアニメーションを開始
    transform( render_targets.type_grid );

    // 各種イベント登録
    // ウィンドウのリサイズ時にコンテナのサイズをリフレッシュ
    window.addEventListener( 'resize', onWindowResize );


}

function animate(){
    // console.log('fn animate')
    trackball_controll.update();
    TWEEN.update();
    requestAnimationFrame( animate );
}

function transform( targets  )
{
    console.log('fn transform', targets)
    // render()
    // return;
    TWEEN.removeAll();

    const common_duration = 2000; // ms
    const duration_accetable_max_multiple = 2
    const max_duration = common_duration * duration_accetable_max_multiple
    const randomness_duration_for_position = Math.random() * max_duration
    const randomness_duration_for_rotation = Math.random() * max_duration

    for ( let i = 0; i < css_3d_objects.length; i ++ ) {

        const css_3d_object = css_3d_objects[ i ];
        const target = targets[ i ];

        // 位置
        new TWEEN.Tween( css_3d_object.position )
            .to({
                    x: target.position.x,
                    y: target.position.y,
                    z: target.position.z
                },
                randomness_duration_for_position
            )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        // 回転
        new TWEEN.Tween( css_3d_object.rotation )
            .to({
                    x: target.rotation.x,
                    y: target.rotation.y,
                    z: target.rotation.z
                },
                randomness_duration_for_rotation
            )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();
    }

    // 画面を再描画するためだけのTween設定。
    // 実際のアニメーションには関与しない。
    // 位置が変わったのでレンダリング（アニメーションが完了するまでの最大の所要時間を指定）
    new TWEEN.Tween( this )
        .to( {}, max_duration )
        .onUpdate( render )
        .start();
}

function render(){
    // console.log('fn render')
    renderer.render( scene, camera );
}

function onWindowResize() {
    console.log('fn onWindowResize');
    // カメラのアスペクト比を正す
    camera.aspect = window.innerWidth / window.innerHeight;
    // カメラのパラメータが変更されたことを通知
    camera.updateProjectionMatrix();
    // レンダラーのサイズを調整
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
}
