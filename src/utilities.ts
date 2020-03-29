import { Entity } from './components/Entity/Entity';

export function lerp(v0: number, v1: number, t: number): number {
    return v0 + t * (v1 - v0);
}

export function areColliding(entity1: Entity, entity2: Entity): boolean {
    let { x: x1, y: y1, radius: r1 } = entity1.getModelData();
    let { x: x2, y: y2, radius: r2 } = entity2.getModelData();
    return distance(x1, y1, x2, y2) <= r1 + r2;
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.floor(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
}
