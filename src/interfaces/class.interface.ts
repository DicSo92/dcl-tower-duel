import TowerBlock from "@/towerBlock";
import {FallingBlock} from "@/fallingBlock";

export interface ITowerDuel {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus
    blockCount: number
    maxCount: number
    spawnInterval: Entity
    blocks: TowerBlock[]
    offsetY: number
    lastScale: Vector3
    lastPosition: Vector3
    fallingBlocks: FallingBlock[]

    update?(dt: number): void
}
export interface ITowerBlock {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    TowerDuel: ITowerDuel
    entity: Entity
    isBase: Boolean
    scale: Vector3
    position: Vector3

    update?(dt: number): void
}
