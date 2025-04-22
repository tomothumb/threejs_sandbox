import * as THREE from 'three';

/**
 * アニメーションについて
 */
export class ArcAnimationController {
    constructor(arcs) {
        this.arcs = arcs;
        this.clock = new THREE.Clock();
        this.isAnimating = true;
    }

    update() {
        if (!this.isAnimating) return;

        const deltaTime = this.clock.getDelta();

        // 各円弧の回転を更新
        this.arcs.forEach(arc => {
            // 現在の回転角度を更新
            arc.rotation.current += arc.rotation.speed * deltaTime;

            // 回転角度を0-2πの範囲に正規化
            arc.rotation.current %= Math.PI * 2;

            // 円弧の開始角度と終了角度を更新
            const rotationOffset = arc.rotation.current;
            const originalStart = arc.start;
            const originalEnd = arc.end;
            const arcLength = originalEnd - originalStart;

            // 回転後の角度を設定
            arc.currentStart = (originalStart + rotationOffset) % (Math.PI * 2);
            arc.currentEnd = arc.currentStart + arcLength;
        });
    }

    // アニメーションの一時停止/再開
    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        if (this.isAnimating) {
            this.clock.start();
        } else {
            this.clock.stop();
        }
    }

    // 特定の円弧の回転速度を変更
    setArcSpeed(index, newSpeed) {
        if (index >= 0 && index < this.arcs.length) {
            this.arcs[index].rotation.speed = newSpeed;
        }
    }
}