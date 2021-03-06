import TowerDuel from "@/towerDuel";

export default class Heart implements ISystem {
    TowerDuel: TowerDuel
    messageBus: MessageBus

    entity: Entity;
    isActive: boolean

    constructor(towerDuel: TowerDuel, position: Vector3, isActive: boolean) {
        this.TowerDuel = towerDuel
        this.messageBus = towerDuel.mainGame.parent.messageBus
        this.isActive = isActive

        this.entity = new Entity()
        this.entity.addComponent(new GLTFShape("models/HeartFlat.glb"))
        this.entity.addComponent(new Transform({
            position: position,
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
    }
}
