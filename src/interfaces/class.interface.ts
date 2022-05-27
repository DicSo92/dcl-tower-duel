import TowerBlock from "@/towerBlock";
import {FallingBlock} from "@/fallingBlock";
import { MoveTransformComponent } from "@dcl/ecs-scene-utils";
import LiftToGame from "@/liftToGame";
import Spawner from "@/spawner";
import Lift from "@/lift";
import MainGame from "@/mainGame";
import { SelectModeAction } from "@/actions/modeSelection";
import { AssetsGame } from "@/assets";
import PhysicsSystem from "@/physicsSystem";
import LifeHearts from "@/lifeHearts";
import StaminaBar from "@/staminaBar";

export interface ITowerDuel {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    mainGame: MainGame;
    messageBus: MessageBus
    assetsGame: AssetsGame

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
    lift: ILift
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
export interface ILiftToGame {
    entity: Entity
    lift: Entity
    parent: MainGame
    startPos: Vector3
    endPos: Vector3
    startPath: Vector3[]
    endPath: Vector3[]
    pathLength: number
    isActive: boolean
    radius: number

    goToPlay(): void
    goToLobby(): void
    update?(dt: number): void
}
export interface ILift {
    TowerDuel: ITowerDuel
    global: Entity
    lift: Entity
    playerInputs: Input
    step: number
    state: boolean
    startPos: Vector3
    endPosY: number
    hearts: LifeHearts
    staminaBar: StaminaBar
    
    autoMove(): void
    reset(): void
    moveUp(): void
    moveDown(): void
    Delete(): void
    update?(dt: number): void
}
export interface IMainGame {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus

    TowerDuel?: ITowerDuel[] // ITowerDuel
    liftToGame: ILiftToGame
    modeSelectionAction: SelectModeAction
    isActive: boolean

    modeSelection(type: string): void
    gameApprovalSolo(type: string): void
    gameApprovalMulti(type: string): void
    launchGame(type: string): void
    afterTowerDuel(type: string): void
    update?(dt: number): void
}

export interface IAssetsGame {
    heartBase: GLTFShape
    heartOn: GLTFShape
    heartOff: GLTFShape
}

export interface IAssetsScene { 
    higherTowerModel: GLTFShape
    higherTowerAnimStates: AnimationState[]
}
