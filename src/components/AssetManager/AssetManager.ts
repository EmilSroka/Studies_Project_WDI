export const ImageRegex: RegExp = /\.(png|jpn?g)$/;
export const AudioRegex: RegExp = /\.mp3$/;
type AssetFileTypes = HTMLImageElement | HTMLAudioElement;

export class AssetManager {
    private ready: Array<string> = [];

    constructor(private unready: Array<string>) {}

    public isEveryAssetLoaded(): boolean {
        return this.unready.length === 0;
    }

    public loadUnreadyAssets(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const unloadedFiles: Array<string> = [];
            const loadedImages: Array<Promise<string>> = this.unready.map(
                this.loadFile.bind(this)
            );
            loadedImages.forEach((imagePromise) =>
                imagePromise
                    .then((url) => this.ready.push(url))
                    .catch((url) => unloadedFiles.push(url))
            );
            Promise.all(loadedImages)
                .then((urls) => {
                    this.unready = [];
                    resolve(urls);
                })
                .catch((url) => {
                    this.unready = unloadedFiles;
                    reject(url);
                });
        });
    }

    private loadFile(url: string): Promise<string> {
        let file = this.createCorrespondingDOMElement(url);
        return new Promise((resolve, reject) => {
            file.src = url;
            file.addEventListener('load', () => {
                resolve(url);
                file.remove();
            });
            file.addEventListener('canplaythrough', () => {
                resolve(url);
                file.remove();
            });
            file.addEventListener('error', () => {
                reject(url);
                file.remove();
            });
        });
    }

    private createCorrespondingDOMElement(url: string): AssetFileTypes {
        if (ImageRegex.test(url)) {
            return new Image();
        } else if (AudioRegex.test(url)) {
            return new Audio();
        } else {
            throw new Error('Unsupported file format');
        }
    }
}
