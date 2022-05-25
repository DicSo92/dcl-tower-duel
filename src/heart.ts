import { ITowerDuel } from "@/interfaces/class.interface";

export default class Heart implements ISystem {
    messageBus: MessageBus

    entity: Entity;
    heartBase: GLTFShape
    heartOn: GLTFShape
    heartOff: GLTFShape
    heart: Entity
    base: Entity
    isActive: Boolean

    constructor(position: Vector3, messageBus: MessageBus, isActive: boolean) {
        this.messageBus = messageBus
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

        this.heartBase = new GLTFShape('models/HeartBase.glb')
        this.heartOn =  new GLTFShape('models/HeartOn.glb')
        this.heartOff =  new GLTFShape('models/HeartOff.glb')

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
