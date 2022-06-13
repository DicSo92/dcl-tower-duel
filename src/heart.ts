import { ITowerDuel } from "@/interfaces/class.interface";

export default class Heart implements ISystem {
    TowerDuel: ITowerDuel
    messageBus: MessageBus

    entity: Entity;
    isActive: boolean

    constructor(towerDuel: ITowerDuel, position: Vector3, isActive: boolean) {
        this.TowerDuel = towerDuel
        this.messageBus = towerDuel.messageBus
        this.isActive = isActive

        this.entity = new Entity()
        this.entity.addComponent(new GLTFShape("models/HeartFlat.glb"))
        this.entity.addComponent(new Transform({
            position: position,
            // scale: new Vector3(0.13, 0.13, 0.13)
        }))
        this.entity.getComponent(Transform).rotation.eulerAngles = new Vector3(180, 90, 0)

        this.Init()
    }
    Init = () => {
        this.buildHeart()
    }
    // -----------------------------------------------------------------------------------------------------------------
    buildHeart = () => {
        this.entity.getComponent(GLTFShape).visible = this.isActive
    }

    toggle() {
        this.isActive = !this.isActive
        this.entity.getComponent(GLTFShape).visible = this.isActive
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
