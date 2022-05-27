import { ILift, ITowerDuel } from "@/interfaces/class.interface";

import Lift from "@/lift";
import TowerBlock from "@/towerBlock";
import PhysicsSystem from "@/physicsSystem";
import { FallingBlock } from "@/fallingBlock";
import Spawner from "@/spawner";
import MainGame from "./mainGame";
import { GameAsset } from "@/assets";

export default class TowerDuel implements ISystem, ITowerDuel {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    mainGame: MainGame;
    messageBus: MessageBus
    gameAsset: GameAsset

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
    isActive: Boolean = false
    physicsSystem?: PhysicsSystem;
    currentBlock?: TowerBlock
    prevBlock?: TowerBlock

    constructor(cannonMaterial: CANNON.Material, cannonWorld: CANNON.World, mainGame: MainGame, pos: Vector3) {
        this.physicsMaterial = cannonMaterial
        this.world = cannonWorld
        this.mainGame = mainGame
        this.messageBus = this.mainGame.messageBus
        this.gameAsset = this.mainGame.parent.gameAsset

        this.towerDuelId = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);

        this.gameArea = new Entity()
        this.gameArea.addComponent(new Transform({
            position: pos,
            scale: new Vector3(1, 1, 1)
        }))
        engine.addEntity(this.gameArea)

        this.blockCount = 0
        this.maxCount = 10
        this.blocks = []
        this.offsetY = 0.2
        this.lastScale = new Vector3(4, 0.4, 4)
        this.lastPosition = new Vector3(8, this.offsetY, 8)
        this.fallingBlocks = []
        this.playerInputsListener = Input.instance
        this.isActive = true

        this.Init();
        this.lift = new Lift(this.playerInputsListener, this)
    }

    private Init = () => {
        this.BuildEvents()

        this.spawner = new Spawner(this);
        // engine.addSystem(this.spawner);

        this.towerBlock = new TowerBlock(this, undefined, true);
        // engine.addSystem(this.towerBlock);

        this.physicsSystem = new PhysicsSystem(this.fallingBlocks, this.world)
        engine.addSystem(this.physicsSystem)
    };

    private BuildEvents() {
    }
    public StopBlock() {
        log('stop block')
        this.currentBlock = this.blocks[this.blocks.length - 1]
        this.prevBlock = this.blocks[this.blocks.length - 2]
        if(this.prevBlock) this.currentBlock?.stopBlock(this.prevBlock)
    }

    public GameFinish() {
        this.isActive = false
        this.spawner?.Delete()
        if(this.spawner) engine.removeSystem(this.spawner)
        this.mainGame.afterTowerDuel()
    }

    public CleanEntities() {
        engine.removeEntity(this.gameArea)
        this.currentBlock?.Delete()
        this.prevBlock?.Delete()
        this.towerBlock?.Delete()
        if (this.blocks) {
            for (let block in this.blocks) {
                this.blocks[block].Delete()
            }
        }
        if (this.fallingBlocks) {
            for (let block in this.fallingBlocks) {
                this.fallingBlocks[block].Delete()
            }
        }
        if(this.physicsSystem) engine.removeSystem(this.physicsSystem)
    }

    public update(dt: number) {
        // log("Update", dt)
    }
}
