import TowerBlock from "@/towerBlock";
import {FallingBlock} from "@/fallingBlock";
import { MoveTransformComponent } from "@dcl/ecs-scene-utils";
import LiftToGame from "@/liftToGame";
import Spawner from "@/spawner";
import Lift from "@/lift";
import MainGame from "@/mainGame";
import { SelectModeAction } from "@/actions/modeSelection";
import Assets from "@/assets";
import PhysicsSystem from "@/physicsSystem";

export interface ITowerDuel {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    mainGame: MainGame;
    messageBus: MessageBus
    assets: Assets

    towerDuelId: string

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
    physicsSystem?: PhysicsSystem;
    currentBlock?: TowerBlock
    prevBlock?: TowerBlock

    CleanEntities(): void
    StopBlock(): void
    GameFinish(): void
    update?(dt: number): void
}
export interface ITowerBlock {
    TowerDuel: ITowerDuel
    // messageBus: MessageBus
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
    modeSelectionAction: SelectModeAction
    isActive: boolean

    modeSelection(type: string): void
    gameApprovalSolo(type: string): void
    gameApprovalMulti(type: string): void
    launchGame(type: string): void
    afterTowerDuel(type: string): void
    update?(dt: number): void
}
