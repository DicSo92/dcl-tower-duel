import TowerBlock from "@/towerBlock";
import {FallingBlock} from "@/fallingBlock";
import {MoveTransformComponent} from "@dcl/ecs-scene-utils";
import PlayerSelector from "@/playerSelector";

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
    isActive: Boolean

    CleanEntities(): void
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
export interface IPlayerSelector {
    entity: Entity
    selector: Entity
    messageBus: MessageBus
    startPath: Vector3[]
    endPath: Vector3[]
    step: number

    update?(dt: number): void
}

export interface IMainGame {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus

    TowerDuel?: ITowerDuel[] // ITowerDuel
    liftToGame: PlayerSelector

    update?(dt: number): void
}
