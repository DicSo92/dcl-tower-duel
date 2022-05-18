import TowerBlock from "@/towerBlock";
import GreenButton from "@/greenButton";
import { ITowerDuel } from "@/interfaces/class.interface";

import * as utils from '@dcl/ecs-scene-utils'
import {MoveTransformComponent} from "@dcl/ecs-scene-utils";
import RedButton from "@/redButton";

export default class TowerDuel implements ISystem, ITowerDuel {
    messageBus: MessageBus
    blockCount: number
    maxCount: number
    spawnInterval: Entity
    blocks: TowerBlock[]
    offsetY: number
    lastScale: Vector3
    lastPosition: Vector3

    constructor(messageBus: MessageBus) {
        this.messageBus = messageBus
        this.blockCount = 0
        this.maxCount = 10
        this.spawnInterval = new Entity()
        this.blocks = []
        this.offsetY = 0.2
        this.lastScale = new Vector3(4, 0.4, 4)
        this.lastPosition = new Vector3(8, this.offsetY, 8)
        this.Init();
    }

    private Init = () => {
        this.BuildButtons()
        this.BuildEvents()
        const towerBlock = new TowerBlock(this,true);
        engine.addSystem(towerBlock);

        // this.startSpawn()
    };

    private startSpawn() {
        this.spawnInterval.addComponent(new utils.Interval(2500, () => {
            const spawningBlock = new TowerBlock(this, false);
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
            const spawningBlock = new TowerBlock(this,false);
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

