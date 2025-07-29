import { defineConfig } from 'vite';

export default defineConfig({
    base: './',  // 相対パスを使用するように設定
    build: {
        outDir: 'dist',  // ビルド出力先ディレクトリ
        assetsDir: 'assets',  // アセットファイルの出力先ディレクトリ
        rollupOptions: {
            output: {
                assetFileNames: 'assets/[name]-[hash][extname]',
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
            }
        }
    }
});