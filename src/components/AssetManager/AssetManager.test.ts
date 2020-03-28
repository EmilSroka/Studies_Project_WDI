import { AssetManager, ImageRegex, AudioRegex } from './AssetManager';

const fileList = ['./file1.png', './file2.png'];

describe('AssetManager object', () => {
    it('stores paths to unload files', () => {
        let assetManager = new AssetManager(fileList);
        expect((assetManager as any).unready).toHaveLength(2);
    });

    it('allows png, jpg, jpng, mp3 extensions', () => {
        expect(ImageRegex.test('test.png')).toBe(true);
        expect(ImageRegex.test('test.jpg')).toBe(true);
        expect(ImageRegex.test('test.jpng')).toBe(true);
        expect(AudioRegex.test('test.mp3')).toBe(true);
    });

    it('loadUnreadyAssets method returns promise', () => {
        let assetManager = new AssetManager(fileList);
        expect(assetManager.loadUnreadyAssets() instanceof Promise).toBe(true);
    });

    it('isEveryAssetLoaded method returns boolean', () => {
        let assetManager = new AssetManager(fileList);
        let emptyAssetManager = new AssetManager([]);
        expect(assetManager.isEveryAssetLoaded()).toBe(false);
        expect(emptyAssetManager.isEveryAssetLoaded()).toBe(true);
    });
});
