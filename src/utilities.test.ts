import { lerp, areColliding } from './utilities';

jest.mock('./components/Entity/Entity', () => {
    class Entity {
        constructor(
            private x: number,
            private y: number,
            private radius: number
        ) {}
        getModelData() {
            return {
                x: this.x,
                y: this.y,
                radius: this.radius,
            };
        }
    }
    return { Entity };
});

import { Entity } from './components/Entity/Entity';

describe('lerp(v0, v1, t) function interpolates value linearly', () => {
    it('returns (for t between 0 and 1) value between v0 and v1 ', () => {
        let min = 0,
            max = 10;
        for (let i = 0.1; i < 1; i += 0.1) {
            let result = lerp(min, max, i);
            expect(result).toBeLessThan(max);
            expect(result).toBeGreaterThan(min);
        }
    });
    it.each([
        [0, 1, 0.3, 0.3],
        [0, 2, 0.3, 0.6],
        [1, 2, 0.3, 1.3],
        [0, 10, 0.3, 3],
        [-10, 10, 0.5, 0],
    ])('lerp(%d, %d, %d) returns %d', (v1, v2, t, expected) => {
        expect(lerp(v1, v2, t)).toBeCloseTo(expected);
    });
});

describe('areColliding(entity1, entity2) function', () => {
    it('returns true when objects are colliding', () => {
        const MockedEntity = <jest.Mock<Entity>>Entity;
        const mockedEntity1 = <jest.Mocked<Entity>>new MockedEntity(0, 0, 2);
        const mockedEntity2 = <jest.Mocked<Entity>>new MockedEntity(1, -1, 1);
        expect(areColliding(mockedEntity1, mockedEntity2)).toBe(true);
    });

    it('returns true when objects have only one common point', () => {
        const MockedEntity = <jest.Mock<Entity>>Entity;
        const mockedEntity1 = <jest.Mocked<Entity>>new MockedEntity(0, 0, 2);
        const mockedEntity2 = <jest.Mocked<Entity>>new MockedEntity(0, 3, 1);
        expect(areColliding(mockedEntity1, mockedEntity2)).toBe(true);
    });

    it('returns true when one object is inside second one', () => {
        const MockedEntity = <jest.Mock<Entity>>Entity;
        const mockedEntity1 = <jest.Mocked<Entity>>new MockedEntity(0, 0, 2);
        const mockedEntity2 = <jest.Mocked<Entity>>new MockedEntity(0, 0, 1);
        expect(areColliding(mockedEntity1, mockedEntity2)).toBe(true);
    });

    it("returns false when objects aren't colliding", () => {
        const MockedEntity = <jest.Mock<Entity>>Entity;
        const mockedEntity1 = <jest.Mocked<Entity>>new MockedEntity(0, 0, 2);
        const mockedEntity2 = <jest.Mocked<Entity>>new MockedEntity(5, 5, 1);
        expect(areColliding(mockedEntity1, mockedEntity2)).toBe(false);
    });
});
