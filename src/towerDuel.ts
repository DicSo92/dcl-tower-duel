import { ITowerDuel } from "@/interfaces/class.interface";
import { Interval } from "@dcl/ecs-scene-utils";

import Lift from "@/lift";
import TowerBlock from "@/towerBlock";
import GreenButton from "@/greenButton";
import RedButton from "@/redButton";
import PhysicsSystem from "@/physicsSystem";
import { FallingBlock } from "@/fallingBlock";
import Spawner from "@/spawner";

export default class TowerDuel implements ISystem, ITowerDuel {
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

    constructor(cannonMaterial: CANNON.Material, cannonWorld: CANNON.World, messageBus: MessageBus) {
        this.physicsMaterial = cannonMaterial
        this.world = cannonWorld

        this.messageBus = messageBus
        this.blockCount = 0
        this.maxCount = 10
        this.blocks = []
        this.offsetY = 0.2
        this.lastScale = new Vector3(4, 0.4, 4)
        this.lastPosition = new Vector3(24, this.offsetY, 8)
        this.fallingBlocks = []
        this.playerInputsListener = Input.instance

        this.Init();
    }

    private Init = () => {
        this.BuildEvents()

        const spawner = new Spawner(this.physicsMaterial, this.world, this, this.messageBus);
        engine.addSystem(spawner);

        const towerBlock = new TowerBlock(this.physicsMaterial, this.world, this,true);
        engine.addSystem(towerBlock);

        engine.addSystem(new PhysicsSystem(this.fallingBlocks, this.world))

        const lift = new Lift(this.playerInputsListener, this.messageBus)
        engine.addSystem(lift)

        this.BuildButtons()
    };

    private BuildButtons() {
        const greenButton = new GreenButton(this.messageBus);
        engine.addSystem(greenButton);

        const redButton = new RedButton(this.messageBus);
        engine.addSystem(redButton);
    }

    private BuildEvents() {
        this.messageBus.on("redButtonClick", (test) => {
            log('stop block')
            const currentBlock: TowerBlock = this.blocks[this.blocks.length - 1]
            const prevBlock: TowerBlock = this.blocks[this.blocks.length - 2]
            currentBlock.stopBlock(prevBlock)

        })
    }

    public update(dt: number) {
        // log("Update", dt)
    }
}
