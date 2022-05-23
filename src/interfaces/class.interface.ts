import TowerBlock from "@/towerBlock";
import {FallingBlock} from "@/fallingBlock";
import { MoveTransformComponent } from "@dcl/ecs-scene-utils";
import LiftToGame from "@/liftToGame";
import Spawner from "@/spawner";
import Lift from "@/lift";

export interface ITowerDuel {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus

    gameArea: Entity
    blockCount: number
    maxCount: number
    blocks: TowerBlock[]
    offsetY: number
    lastScale: Vector3
    lastPosition: Vector3
    fallingBlocks: FallingBlock[]
    spawner?: Spawner
    towerBlock?: TowerBlock
    lift?: Lift
    playerInputsListener: Input
    isActive: Boolean

    CleanEntities(): void
    update?(dt: number): void
}
export interface ITowerBlock {
    TowerDuel: ITowerDuel
    messageBus: MessageBus
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
    liftToGame: LiftToGame

    update?(dt: number): void
}
