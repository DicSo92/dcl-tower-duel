import { ITowerDuel } from "@/interfaces/class.interface";
import Heart from "./heart";
import Lift from "./lift";

export default class LifeHearts implements ISystem {
    messageBus: MessageBus
    entity: Entity;
    hearts: Heart[] = []
    maxHearts: number = 3
    heartCount: number = this.maxHearts

    constructor(parent: Lift) {
        this.messageBus = parent.TowerDuel.messageBus
        this.entity = new Entity()
        this.entity.setParent(parent.global)
        this.entity.addComponent(new Transform({
            position: new Vector3(-.75, 1.5, -1.5),
            scale: new Vector3(1, 1, 1)
        }))
        this.entity.getComponent(Transform).rotation.eulerAngles = new Vector3(45, 0, 0)
        this.Init()
    }
    Init = () => {
        this.buildHearts()
        this.buildEvents()
    }
    // -----------------------------------------------------------------------------------------------------------------
    buildHearts = () => {
        for (let i = 1; i <= this.maxHearts; i++) {
            const heart = new Heart(new Vector3(0.5 * i, 0, 0), this.messageBus, true)
            heart.entity.setParent(this.entity)
            this.hearts.push(heart)
        }
    }

    buildEvents = () => {
        this.messageBus.on('looseHeart', () => {
            let fHearts = this.hearts.filter(heart => heart.isActive)
            if (fHearts.length) {
                fHearts[0].toggle()
            } else {
                log("No hearts remaining")
            }
        })
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
