import { ITowerDuel } from "@/interfaces/class.interface";
import Heart from "./heart";

export default class LifeHearts implements ISystem {
    messageBus: MessageBus
    entity: Entity;
    hearts: Heart[] = []
    maxHearts: number = 3
    heartCount: number = this.maxHearts

    constructor(position: Vector3, messageBus: MessageBus) {
        this.messageBus = messageBus
        this.entity = new Entity()
        engine.addEntity(this.entity)
        this.entity.addComponent(new Transform({
            position: position,
            scale: new Vector3(1, 1, 1)
        }))
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
