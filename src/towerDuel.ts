import { ITowerDuel } from "@/interfaces/class.interface";

import Lift from "@/lift";
import TowerBlock from "@/towerBlock";
import PhysicsSystem from "@/physicsSystem";
import { FallingBlock } from "@/fallingBlock";
import Spawner from "@/spawner";

export default class TowerDuel implements ISystem, ITowerDuel {
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
    isActive: Boolean = false

    constructor(cannonMaterial: CANNON.Material, cannonWorld: CANNON.World, messageBus: MessageBus) {
        this.physicsMaterial = cannonMaterial
        this.world = cannonWorld
        this.messageBus = messageBus

        this.gameArea = new Entity()
        this.gameArea.addComponent(new Transform({
            position: new Vector3(16, 0, 0),
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
    }

    private Init = () => {
        this.BuildEvents()

        this.spawner = new Spawner(this);
        engine.addSystem(this.spawner);

        this.towerBlock = new TowerBlock(this, undefined, true);
        // engine.addSystem(this.towerBlock);

        engine.addSystem(new PhysicsSystem(this.fallingBlocks, this.world))

        this.lift = new Lift(this.playerInputsListener, this, this.messageBus)
        // engine.addSystem(this.lift)
    };

    private BuildEvents() {
        this.messageBus.on("redButtonClick", (test) => {
            log('stop block')
            const currentBlock: TowerBlock = this.blocks[this.blocks.length - 1]
            const prevBlock: TowerBlock = this.blocks[this.blocks.length - 2]
            currentBlock.stopBlock(prevBlock)

        })
        this.messageBus.on("gameFinished", (test) => {
            log('onGameFinished')
            this.isActive = false
            this.messageBus.emit("AfterTowerDuelSequence", {
                test: "AfterTowerDuelSequence"
            })
        })
    }

    public CleanEntities() {
        this.spawner?.Delete()
        this.lift?.Delete()
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
        this.towerBlock?.Delete()
    }

    public update(dt: number) {
        // log("Update", dt)
    }
}
