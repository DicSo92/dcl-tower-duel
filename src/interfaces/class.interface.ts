import TowerBlock from "@/towerBlock";
import {FallingBlock} from "@/fallingBlock";
import {MoveTransformComponent} from "@dcl/ecs-scene-utils";

export interface ITowerDuel {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus
    blockCount: number
    maxCount: number
    blocks: TowerBlock[]
    offsetY: number
    lastScale: Vector3
    lastPosition: Vector3
    fallingBlocks: FallingBlock[]
    playerInputsListener: Input

    update?(dt: number): void
}
export interface ITowerBlock {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    TowerDuel: ITowerDuel
    isBase: Boolean
    animation?: MoveTransformComponent

    entity: Entity

    update?(dt: number): void
}
