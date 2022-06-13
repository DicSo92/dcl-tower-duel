import TowerDuel from "@/towerDuel";

export default class Heart implements ISystem {
    TowerDuel: TowerDuel
    messageBus: MessageBus

    entity: Entity;
    heartBase: GLTFShape
    heartOn: GLTFShape
    heartOff: GLTFShape
    heart: Entity
    base: Entity
    isActive: Boolean

    constructor(towerDuel: TowerDuel, position: Vector3, isActive: boolean) {
        this.TowerDuel = towerDuel
        this.messageBus = towerDuel.messageBus
        this.isActive = isActive

        this.entity = new Entity()
        this.heart = new Entity()
        this.base = new Entity()
        engine.addEntity(this.entity)
        this.heart.setParent(this.entity)
        this.base.setParent(this.entity)

        this.entity.addComponent(new Transform({
            position: position,
            scale: new Vector3(0.13, 0.13, 0.13)
        }))

        this.heartBase = this.TowerDuel.gameAssets.heartBase
        this.heartOn = this.TowerDuel.gameAssets.heartOn
        this.heartOff = this.TowerDuel.gameAssets.heartOff

        this.Init()
    }
    Init = () => {
        this.buildHeart()
        this.buildEvents()
    }
    // -----------------------------------------------------------------------------------------------------------------
    buildHeart = () => {
        this.base.addComponent(this.heartBase)
        this.heart.addComponentOrReplace(this.isActive ? this.heartOff : this.heartOn) // init other color for smooth first transition
        this.heart.addComponentOrReplace(this.isActive ? this.heartOn : this.heartOff)
    }

    buildEvents = () => {
        this.heart.addComponent(
            new OnPointerDown(() => {
                log('heart click')
                this.messageBus.emit("looseHeart", {})
            }, {
                button: ActionButton.POINTER,
                showFeedback: true,
                hoverText: "Remove Heart",
            })
        )
    }
    toggle() {
        this.isActive = !this.isActive
        this.heart.addComponentOrReplace(this.isActive ? this.heartOn : this.heartOff)
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
