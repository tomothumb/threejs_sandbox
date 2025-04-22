/**
 * カラーについて
 */
class ColorUtils {
    static hslToHex(h, s, l) {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        const r = hue2rgb(p, q, h + 1/3);
        const g = hue2rgb(p, q, h);
        const b = hue2rgb(p, q, h - 1/3);

        const toHex = x => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return parseInt(`0x${toHex(r)}${toHex(g)}${toHex(b)}`);
    }

    static random(min, max) {
        return min + Math.random() * (max - min);
    }

    // 色相を0-1の範囲に正規化
    static normalizeHue(hue) {
        hue = hue % 1;
        return hue < 0 ? hue + 1 : hue;
    }
}

// ランダムな色を生成する関数
export function getRandomColor() {
    return Math.floor(Math.random() * 0xFFFFFF);
}

/**
 * 配色アルゴリズム
 */


// 配色戦略のインターフェース
export class ColorSchemeStrategy {
    generateColors(baseHue, count) {
        throw new Error('generateColors must be implemented');
    }
}

// アナログ配色戦略
export class AnalogousSchemeStrategy extends ColorSchemeStrategy {
    constructor(options = {}) {
        super();
        this.options = {
            analogousRange: 0.083, // 30度
            saturation: { min: 0.5, max: 0.7 },
            lightness: { min: 0.4, max: 0.6 },
            brightnessThreshold: 0.55,
            ...options
        };
    }

    generateColors(baseHue, count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hueVariation = ColorUtils.random(-this.options.analogousRange/2, this.options.analogousRange/2);
            const hue = ColorUtils.normalizeHue(baseHue + hueVariation);

            let saturation = ColorUtils.random(
                this.options.saturation.min,
                this.options.saturation.max
            );

            let lightness = ColorUtils.random(
                this.options.lightness.min,
                this.options.lightness.max
            );

            if (lightness > this.options.brightnessThreshold) {
                saturation *= 0.85;
            }

            colors.push(ColorUtils.hslToHex(hue, saturation, lightness));
        }
        return colors;
    }
}

// トライアド配色戦略
export class TriadSchemeStrategy extends ColorSchemeStrategy {
    constructor(options = {}) {
        super();
        this.options = {
            saturation: { min: 0.5, max: 0.7 },
            lightness: { min: 0.4, max: 0.6 },
            ...options
        };
    }

    generateColors(baseHue, count) {
        const colors = [];
        const triadAngles = [0, 0.333, 0.666]; // 120度ずつ

        for (let i = 0; i < count; i++) {
            const triadIndex = i % 3;
            const hue = ColorUtils.normalizeHue(baseHue + triadAngles[triadIndex]);

            const saturation = ColorUtils.random(
                this.options.saturation.min,
                this.options.saturation.max
            );

            const lightness = ColorUtils.random(
                this.options.lightness.min,
                this.options.lightness.max
            );

            colors.push(ColorUtils.hslToHex(hue, saturation, lightness));
        }
        return colors;
    }
}

// グレースケール戦略
export class GreyscaleStrategy extends ColorSchemeStrategy {
    constructor(options = {}) {
        super();
        this.options = {
            saturation: 0.02,
            lightness: { min: 0.65, max: 0.85 },
            ...options
        };
    }

    generateColors(baseHue, count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const lightness = ColorUtils.random(
                this.options.lightness.min,
                this.options.lightness.max
            );
            colors.push(ColorUtils.hslToHex(0, this.options.saturation, lightness));
        }
        return colors;
    }
}

// 補色配色戦略
export class ComplementarySchemeStrategy extends ColorSchemeStrategy {
    constructor(options = {}) {
        super();
        this.options = {
            saturation: {min: 0.5, max: 0.7},
            lightness: {min: 0.4, max: 0.6},
            ...options
        };
    }

    generateColors(baseHue, count) {
        const colors = [];
        const complementaryHue = ColorUtils.normalizeHue(baseHue + 0.5); // 180度ずつ

        for (let i = 0; i < count; i++) {
            const hue = i % 2 === 0 ? baseHue : complementaryHue;

            const saturation = ColorUtils.random(
                this.options.saturation.min,
                this.options.saturation.max
            );

            const lightness = ColorUtils.random(
                this.options.lightness.min,
                this.options.lightness.max
            );

            colors.push(ColorUtils.hslToHex(hue, saturation, lightness));
        }
        return colors;
    }
}

// スプリットコンプリメンタリー配色戦略
export class SplitComplementarySchemeStrategy extends ColorSchemeStrategy {
    constructor(options = {}) {
        super();
        this.options = {
            saturation: {min: 0.5, max: 0.7},
            lightness: {min: 0.4, max: 0.6},
            ...options
        };
    }

    generateColors(baseHue, count) {
        const colors = [];
        const splitAngles = [0, 0.417, 0.583]; // Base color and ±150 degrees

        for (let i = 0; i < count; i++) {
            const angleIndex = i % 3;
            const hue = ColorUtils.normalizeHue(baseHue + splitAngles[angleIndex]);

            const saturation = ColorUtils.random(
                this.options.saturation.min,
                this.options.saturation.max
            );

            const lightness = ColorUtils.random(
                this.options.lightness.min,
                this.options.lightness.max
            );

            colors.push(ColorUtils.hslToHex(hue, saturation, lightness));
        }
        return colors;
    }
}

// モノトーン＋アクセントカラー戦略
export class MonotoneWithAccentStrategy extends ColorSchemeStrategy {
    constructor(options = {}) {
        super();
        this.options = {
            accentProbability: 0.2,
            monotone: {
                saturation: 0.05,
                lightness: {min: 0.2, max: 0.8}
            },
            accent: {
                saturation: {min: 0.6, max: 0.8},
                lightness: {min: 0.45, max: 0.65}
            },
            ...options
        };
    }

    generateColors(baseHue, count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            if (Math.random() < this.options.accentProbability) {
                // アクセントカラーの生成
                const saturation = ColorUtils.random(
                    this.options.accent.saturation.min,
                    this.options.accent.saturation.max
                );
                const lightness = ColorUtils.random(
                    this.options.accent.lightness.min,
                    this.options.accent.lightness.max
                );
                colors.push(ColorUtils.hslToHex(baseHue, saturation, lightness));
            } else {
                // モノトーンカラーの生成
                const lightness = ColorUtils.random(
                    this.options.monotone.lightness.min,
                    this.options.monotone.lightness.max
                );
                colors.push(ColorUtils.hslToHex(0, this.options.monotone.saturation, lightness));
            }
        }
        return colors;
    }
}


// メインのカラージェネレータークラス
export class ColorGenerator {
    constructor(baseHue = 0.025, options = {}) {
        this.baseHue = baseHue;
        this.options = {
            greyProbability: 0.3,
            ...options
        };

        // デフォルトの戦略を設定
        this.mainStrategy = new AnalogousSchemeStrategy();
        this.greyStrategy = new GreyscaleStrategy();
    }

    // 戦略の設定
    setMainStrategy(strategy) {
        this.mainStrategy = strategy;
        return this;
    }

    setGreyStrategy(strategy) {
        this.greyStrategy = strategy;
        return this;
    }

    // ベースカラーの設定
    setBaseHue(hue) {
        this.baseHue = hue;
        return this;
    }

    // 配色の生成
    generateColorScheme(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            if (Math.random() < this.options.greyProbability) {
                colors.push(...this.greyStrategy.generateColors(this.baseHue, 1));
            } else {
                colors.push(...this.mainStrategy.generateColors(this.baseHue, 1));
            }
        }
        return colors;
    }
}




//
// // 別の配色戦略を使用する例
// function useTriadColors() {
//     const colorGen = new ColorGenerator(0.025)
//         .setMainStrategy(new TriadSchemeStrategy());
//     return colorGen.generateColorScheme(10);
// }
//
// // カスタム設定の例
// const customColorGen = new ColorGenerator(0.025, {
//     greyProbability: 0.4 // グレースケールの出現確率を40%に
// });
//
// // 動的な戦略の切り替え
// colorGen.setMainStrategy(new TriadSchemeStrategy())
//     .setBaseHue(0.5); // 180度（シアン）をベースにした配色に変更


