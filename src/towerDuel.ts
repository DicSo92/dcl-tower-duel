import Lift from "@/lift";
import TowerBlock from "@/towerBlock";
import PhysicsSystem from "@/physicsSystem";
import { FallingBlock } from "@/fallingBlock";
import Spawner from "@/spawner";
import MainGame from "./mainGame";
import { GameAssets } from "@/assets";

export default class TowerDuel implements ISystem {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    mainGame: MainGame
    messageBus: MessageBus
    gameAssets: GameAssets

    towerDuelId: string
    gameArea: Entity
    spawner?: Spawner
    lift?: Lift
    playerInputsListener: Input = Input.instance
    physicsSystem?: PhysicsSystem
    isActive: Boolean = true

    maxCount: number = 20
    blockScaleY: number = 0.4
    offsetY: number = 1.75
    lastScale: Vector3 = new Vector3(4, this.blockScaleY, 4)
    lastPosition: Vector3 = new Vector3(8, this.offsetY, 8)

    blocks: TowerBlock[] = []
    currentBlocks: TowerBlock[] = []
    fallingBlocks: FallingBlock[] = []
    currentBlock?: TowerBlock
    prevBlock?: TowerBlock

    constructor(cannonMaterial: CANNON.Material, cannonWorld: CANNON.World, mainGame: MainGame, pos: Vector3) {
        this.physicsMaterial = cannonMaterial
        this.world = cannonWorld
        this.mainGame = mainGame
        this.messageBus = this.mainGame.messageBus
        this.gameAssets = this.mainGame.parent.gameAssets

        this.towerDuelId = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);

        this.gameArea = new Entity()
        this.gameArea.addComponent(this.mainGame.parent.sceneAssets.soundStartGame)
        this.gameArea.addComponent(new Transform({
            position: pos,
            scale: new Vector3(1, 1, 1)
        }))
        engine.addEntity(this.gameArea)

        this.gameArea.getComponent(AudioSource).playOnce()
        this.Init();
    }

    private Init = () => {
        this.BuildEvents()

        this.lift = new Lift(this.playerInputsListener, this)

        const towerBlock = new TowerBlock(this, undefined, true);
        engine.addSystem(towerBlock);

        this.spawner = new Spawner(this);
        // engine.addSystem(this.spawner);

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
        this.mainGame.parent.globalScene.getComponent(AudioSource).playOnce()
        this.mainGame.afterTowerDuel()
    }

    public CleanEntities() {
        engine.removeEntity(this.gameArea)
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
