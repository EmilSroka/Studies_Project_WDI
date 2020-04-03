import { Point, wait } from '../../utilities';
import { ModelData } from '../Entity/EntityModel';

export const RESIZE_COOLDOWN_TIME = 100;
export const GAME_WIDTH = 1600;
export const GAME_HEIGHT = 900;

export class CanvasUtils {
    private unit: number;
    private startingPoint: Point = { x: 0, y: 0 };

    constructor() {
        this.setupUpdateOnWindowSizeChange();
        this.updateUnit();
        this.updateStartingPoint();
    }

    public translateX(cooridate: number): number {
        return this.startingPoint.x + this.convertUnit(cooridate);
    }

    public translateY(cooridate: number): number {
        return this.startingPoint.y + this.convertUnit(cooridate);
    }

    public convertUnit(length: number): number {
        return length * this.unit;
    }

    public drawImg(
        context: CanvasRenderingContext2D,
        { x, y, width, height }: ModelData,
        img: HTMLImageElement
    ): void {
        const realWidth = this.convertUnit(width);
        const realHeight = this.convertUnit(height);
        const leftSide = this.translateX(x) - (1 / 2) * realWidth;
        const topSide = this.translateY(y) - (1 / 2) * realHeight;
        context.drawImage(img, leftSide, topSide, width, height);
    }

    public drawCircle(
        context: CanvasRenderingContext2D,
        { x, y, radius }: ModelData,
        color: string
    ): void {
        context.translate(this.translateX(x), this.translateY(y));
        context.beginPath();
        context.arc(0, 0, this.convertUnit(radius), 0, 2 * Math.PI);
        context.strokeStyle = color;
        context.stroke();
    }

    private updateUnit() {
        const { innerWidth, innerHeight } = window;
        this.unit =
            (innerWidth / GAME_WIDTH) * GAME_HEIGHT <= innerHeight
                ? innerWidth / GAME_WIDTH
                : innerHeight / GAME_HEIGHT;
    }

    private updateStartingPoint() {
        this.startingPoint.x = (window.innerWidth - this.unit * GAME_WIDTH) / 2;
        this.startingPoint.y =
            (window.innerHeight - this.unit * GAME_HEIGHT) / 2;
    }

    private setupUpdateOnWindowSizeChange() {
        let cooldown = false;

        window.addEventListener('resize', () => {
            if (!cooldown) {
                startCooldown();
                wait(RESIZE_COOLDOWN_TIME)
                    .then(() => {
                        this.updateUnit();
                        this.updateStartingPoint();
                    })
                    .finally(endCooldown);
            }
        });

        function startCooldown() {
            cooldown = true;
        }

        function endCooldown() {
            cooldown = false;
        }
    }
}
