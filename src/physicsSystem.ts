import { FallingBlock } from "@/fallingBlock";

// Set high to prevent tunnelling
const FIXED_TIME_STEPS = 1.0 / 60
const MAX_TIME_STEPS = 10

export default class PhysicsSystem implements ISystem {
    fallingBlocks: FallingBlock[]
    world: CANNON.World

    constructor(fallingBlocks: FallingBlock[], cannonWorld: CANNON.World) {
        this.fallingBlocks = fallingBlocks
        this.world = cannonWorld
    }

    update(dt: number): void {
        this.world.step(FIXED_TIME_STEPS, dt, MAX_TIME_STEPS)

        for (let i = 0; i < this.fallingBlocks.length; i++) {
            if (!this.fallingBlocks[i].isActive) {
                this.fallingBlocks[i].getComponent(Transform).position.copyFrom(this.fallingBlocks[i].body.position)
                this.fallingBlocks[i].getComponent(Transform).rotation.copyFrom(this.fallingBlocks[i].body.quaternion)
            }
        }
    }
}
