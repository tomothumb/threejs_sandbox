import * as THREE from "three";


export const attachRenderer = (canvas) => {
    // カメラ
    const renderer = new THREE.WebGLRenderer( {
        antialias: true,
        stencil: true ,
        canvas
    });
    renderer.shadowMap.enabled = true;
    return renderer;
}

export const attachScene = (background_color) => {
    // シーン
    const scene = new THREE.Scene();
    if(background_color !== undefined && background_color !== null){
        scene.background = new THREE.Color(background_color);
    }
    return scene;
}

export const attachCamera = (setting, canvas) => {
    // カメラ
    const camera = new THREE.PerspectiveCamera(
        setting.fov,
        canvas.clientWidth / canvas.clientHeight,
        setting.near,
        setting.far
    );
    camera.position.z = 20;
    // camera.position.set( 25,30, 80);
    camera.position.set( setting.camera_x,setting.camera_y, setting.camera_z);
    return camera;
}


export const attachFog = (scene) => {
    // フォグ
    scene.fog = new THREE.FogExp2(0xFFFFFF, 0.005);
    return scene;
}

export const attachHelpers = (scene) => {

    // グリッドヘルパー
    const gridHelper = new THREE.GridHelper( 100, 50 );
    scene.add( gridHelper );

    // 軸ヘルパー
    const axesHelper = new THREE.AxesHelper( 100 );
    scene.add( axesHelper );
    return scene
}

export const attachAmbientLight = (scene) => {
    // 環境光
    const ambient_light = new THREE.AmbientLight( 0xFFFFFF );
    scene.add( ambient_light );
    return scene;
}