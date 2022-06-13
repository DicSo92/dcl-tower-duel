import TowerBlock from "@/towerBlock";
import { FallingBlock } from "@/fallingBlock";
import { MoveTransformComponent } from "@dcl/ecs-scene-utils";
import Spawner from "@/spawner";
import MainGame from "@/mainGame";
import { SelectModeAction } from "@/actions/modeSelection";
import { GameAssets } from "@/assets";
import PhysicsSystem from "@/physicsSystem";
import LifeHearts from "@/lifeHearts";
import StaminaBar from "@/staminaBar";
import NumericalCounter from "@/numericalCounter";
import HigherTower from "@/higherTower";
import FallingBlocks from "@/fallingBlocks";
import InterEffect from "@/interEffect";
import { LeaderBoard } from "@/LeaderBoard";

export interface IGame {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus
    gameAssets: IGameAssets
    sceneAssets: ISceneAssets
    mainGame0?: IMainGame
    mainGame1?: IMainGame
    usersInGame: Array<String>
    userId?: string
    rulesBtn: Entity
    playBtn: Entity
    globalScene: Entity
    higherTower?: HigherTower
    streamSource?: Entity
    leaderBoard?: LeaderBoard

    SetupWorldConfig(): void
    buildScene(): void
    BuildEvents(): void
    update?(dt: number): void
}
export interface ITowerDuel {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    mainGame: MainGame
    messageBus: MessageBus
    gameAssets: GameAssets

    towerDuelId: string
    gameArea: Entity
    spawner?: Spawner
    lift?: ILift
    playerInputsListener: Input
    physicsSystem?: PhysicsSystem
    isActive: Boolean

    maxCount: number
    blockScaleY: number
    offsetY: number
    lastScale: Vector3
    lastPosition: Vector3

    blocks: TowerBlock[]
    currentBlocks: TowerBlock[]
    fallingBlocks: FallingBlock[]
    currentBlock?: TowerBlock
    prevBlock?: TowerBlock

    CleanEntities(): void
    StopBlock(): void
    GameFinish(): void
    update?(dt: number): void
}
export interface ITowerBlock {
    TowerDuel: ITowerDuel
    messageBus: MessageBus
    isBase: Boolean
    animation?: MoveTransformComponent
    entity: Entity
    blockPhysic?: CANNON.Body
    fallingBlocks?: FallingBlocks
    interEffect?: InterEffect
    marginError: number

    update?(dt: number): void
}
export interface ILiftToGame {
    entity: Entity
    lift: Entity
    parent: MainGame
    startPos: Vector3
    endPos: Vector3
    liftMaxHeight: number
    liftMoveDuration: number
    startPath: Vector3[]
    endPath: Vector3[]
    isActive: boolean
    radius: number
    outOfLift: boolean

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
    minPosY: number
    hearts: LifeHearts
    staminaBar: StaminaBar
    numericalCounter: NumericalCounter

    autoMove(): void
    reset(): void
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

export interface IGameAssets {
    heartBase: GLTFShape
    heartOn: GLTFShape
    heartOff: GLTFShape
    numericalCounter: GLTFShape
    liftOpen: GLTFShape
    liftClose: GLTFShape

    blockMaterials: Material[]
    glowMaterial: Material
    noGlowMaterial: Material
}

export interface ISceneAssets {
    gameStarter: GLTFShape
    gameStarterAnimStates: AnimationState[]
    higherTowerModel: GLTFShape
    higherTowerAnimStates: AnimationState[]
    globalScene: GLTFShape
    mobius: GLTFShape
    mobiusAnimStates: AnimationState[]
    rulesBtn: GLTFShape
    rulesBtnAnimStates: AnimationState[]
    playBtn: GLTFShape
    playBtnAnimStates: AnimationState[]
    soundClick: AudioSource
    soundValide: AudioSource
    soundTeleport: AudioSource
    soundLiftMove: AudioSource
    soundStartGame: AudioSource
    soundStopBlock: AudioSource
    soundStopBlockPerfect: AudioSource
    soundLooseLife: AudioSource
    soundLooseGame: AudioSource
    soundSpell: AudioSource
}

export interface IUser {
    public_address: string,
    name: string
}
