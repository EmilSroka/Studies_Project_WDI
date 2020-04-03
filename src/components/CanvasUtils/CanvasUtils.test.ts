import { CanvasUtils, RESIZE_COOLDOWN_TIME } from './CanvasUtils';
import { wait } from '../../utilities';

const sizes: Array<[number, number]> = [
    [1600, 900],
    [3200, 1800],
    [900, 1600],
];

describe('CanvasUtils object', () => {
    it(`calculates ratio between pixels and in-game units on windows change (with ${RESIZE_COOLDOWN_TIME}ms cooldown)`, async () => {
        expect.assertions(3);

        changeWindowSize(...sizes[0]);
        let canvasUtils = new CanvasUtils();
        expect((canvasUtils as any).unit).toBe(1);

        changeWindowSize(...sizes[1]);
        await wait(RESIZE_COOLDOWN_TIME);
        expect((canvasUtils as any).unit).toBe(2);

        changeWindowSize(...sizes[2]);
        await wait(RESIZE_COOLDOWN_TIME);
        expect((canvasUtils as any).unit).toBeCloseTo(0.5625, 5);
    });

    it('calculates top left corner of game board', async () => {
        expect.assertions(4);

        changeWindowSize(...sizes[0]);
        let canvasUtils = new CanvasUtils();
        expect((canvasUtils as any).startingPoint).toMatchObject({
            x: 0,
            y: 0,
        });

        changeWindowSize(...sizes[1]);
        await wait(RESIZE_COOLDOWN_TIME);
        expect((canvasUtils as any).startingPoint).toMatchObject({
            x: 0,
            y: 0,
        });

        changeWindowSize(...sizes[2]);
        await wait(RESIZE_COOLDOWN_TIME);
        expect((canvasUtils as any).startingPoint.y).toBeCloseTo(546.875, 5);
        expect((canvasUtils as any).startingPoint.x).toBe(0);
    });
});

function changeWindowSize(width: number, height: number) {
    Object.assign(window, { innerWidth: width });
    Object.assign(window, { innerHeight: height });
    window.dispatchEvent(new Event('resize'));
}
