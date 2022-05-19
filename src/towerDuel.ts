import Lift from "@/lift";
import TowerBlock from "@/towerBlock";
import GreenButton from "@/greenButton";
import { ITowerDuel } from "@/interfaces/class.interface";

import * as utils from '@dcl/ecs-scene-utils'
import {MoveTransformComponent} from "@dcl/ecs-scene-utils";
import RedButton from "@/redButton";
import {FallingBlock} from "@/fallingBlock";
import PhysicsSystem from "@/physicsSystem";

export default class TowerDuel implements ISystem, ITowerDuel {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus
    blockCount: number
    maxCount: number
    spawnInterval: Entity
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
        this.spawnInterval = new Entity()
        this.blocks = []
        this.offsetY = 0.2
        this.lastScale = new Vector3(4, 0.4, 4)
        this.lastPosition = new Vector3(8, this.offsetY, 8)
        this.fallingBlocks = []
        this.playerInputsListener = Input.instance

        this.Init();
    }

    private Init = () => {
        this.BuildButtons()
        this.BuildEvents()
        const towerBlock = new TowerBlock(this.physicsMaterial, this.world, this,true);
        engine.addSystem(towerBlock);
        engine.addSystem(new PhysicsSystem(this.fallingBlocks, this.world))

        const lift = new Lift(this.playerInputsListener, this.messageBus)
        engine.addSystem(lift)

        // this.startSpawn()
    };

    private startSpawn() {
        this.spawnInterval.addComponent(new utils.Interval(2500, () => {
            const spawningBlock = new TowerBlock(this.physicsMaterial, this.world, this, false);
            engine.addSystem(spawningBlock);
            if (this.blockCount >= this.maxCount) this.spawnInterval.removeComponent(utils.Interval)
        }))
        engine.addEntity(this.spawnInterval)
    }

    private BuildButtons() {
        const greenButton = new GreenButton(new Transform({
            position: new Vector3(4, 1.1, 3),
            rotation: new Quaternion(0, 0, 0, 1),
            scale: new Vector3(2, 2, 2)
        }), this.messageBus);
        engine.addSystem(greenButton);

        const redButton = new RedButton(new Transform({
            position: new Vector3(5, 1.1, 3),
            rotation: new Quaternion(0, 0, 0, 1),
            scale: new Vector3(2, 2, 2)
        }), this.messageBus);
        engine.addSystem(redButton);
    }

    private BuildEvents() {
        this.messageBus.on("greenButtonClick", (test) => {
            log('spawn block')
            const spawningBlock = new TowerBlock(this.physicsMaterial, this.world, this,false);
            engine.addSystem(spawningBlock);
        })
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
