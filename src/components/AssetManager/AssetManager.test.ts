import { AssetManager, ImageRegex, AudioRegex } from './AssetManager';

const correctFiles = ['./file1.png', './file2.mp3'];
const badFiles = ['./file1.png', './file2.mp6'];

describe('AssetManager object', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('stores paths to unload files', () => {
        const assetManager = new AssetManager(correctFiles);
        expect((assetManager as any).unready).toHaveLength(2);
    });

    it('allows png, jpg, jpng, mp3 extensions', () => {
        expect(ImageRegex.test('test.png')).toBe(true);
        expect(ImageRegex.test('test.jpg')).toBe(true);
        expect(ImageRegex.test('test.jpng')).toBe(true);
        expect(AudioRegex.test('test.mp3')).toBe(true);
    });

    it('loadUnreadyAssets method returns promise', () => {
        const assetManager = new AssetManager(correctFiles);
        expect(assetManager.loadUnreadyAssets() instanceof Promise).toBe(true);
    });

    it('loadUnreadyAssets method on success returns paths to loaded files', async () => {
        expect.assertions(1);
        mockSuccess();
        const assetManager = new AssetManager(correctFiles);
        const result = await assetManager.loadUnreadyAssets();
        expect(result).toEqual(expect.arrayContaining(correctFiles));
    });

    it("loadUnreadyAssets method tracks loaded files by moving their paths into 'ready' array", async () => {
        expect.assertions(2);
        mockSuccess();
        const assetManager = new AssetManager(correctFiles);
        await assetManager.loadUnreadyAssets();
        expect((assetManager as any).unready).toHaveLength(0);
        expect((assetManager as any).ready).toHaveLength(2);
    });

    it('loadUnreadyAssets method on loading error throws path to file that failed first', async () => {
        expect.assertions(1);
        mockError();
        const assetManager = new AssetManager(correctFiles);
        try {
            await assetManager.loadUnreadyAssets();
        } catch (result) {
            expect(
                correctFiles.filter((filePath) => filePath === result)
            ).toHaveLength(1);
        }
    });

    it("loadUnreadyAssets throws error with message 'Unsupported file format' when at least one extension is incorrect", async () => {
        expect.assertions(1);
        mockSuccess();
        const assetManager = new AssetManager(badFiles);
        try {
            await assetManager.loadUnreadyAssets();
        } catch (error) {
            expect(error.message).toBe('Unsupported file format');
        }
    });

    it('isEveryAssetLoaded method returns boolean', () => {
        const assetManager = new AssetManager(correctFiles);
        const emptyAssetManager = new AssetManager([]);
        expect(assetManager.isEveryAssetLoaded()).toBe(false);
        expect(emptyAssetManager.isEveryAssetLoaded()).toBe(true);
    });
});

function mockSuccess() {
    jest.spyOn(Image.prototype, 'addEventListener').mockImplementation(
        (type: string, cb: Function) => {
            if (type === 'load') {
                setTimeout(() => {
                    cb();
                }, 100);
            }
        }
    );

    jest.spyOn(Audio.prototype, 'addEventListener').mockImplementation(
        (type: string, cb: Function) => {
            if (type === 'canplaythrough') {
                setTimeout(() => {
                    cb();
                }, 100);
            }
        }
    );
}

function mockError() {
    jest.spyOn(Image.prototype, 'addEventListener').mockImplementation(
        (type: string, cb: Function) => {
            if (type === 'error') {
                setTimeout(() => {
                    cb();
                }, 100);
            }
        }
    );

    jest.spyOn(Audio.prototype, 'addEventListener').mockImplementation(
        (type: string, cb: Function) => {
            if (type === 'error') {
                setTimeout(() => {
                    cb();
                }, 100);
            }
        }
    );
}
