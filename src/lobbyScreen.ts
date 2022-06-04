import {
    MoveTransformComponent,
    ScaleTransformComponent,
    ToggleComponent,
    ToggleState
} from "@dcl/ecs-scene-utils";

export default class LobbyScreen implements ISystem {
    messageBus: MessageBus

    container: Entity
    screen: Entity
    borderModel : GLTFShape
    title: Entity
    borderTopLeft?: Entity
    borderTopRight?: Entity
    borderBotLeft?: Entity
    borderBotRight?: Entity

    animationDuration: number = 0.6
    titleOffsetTop: number = 0.55
    queueScale: Vector3 = new Vector3(2.75, 3, 0.05)
    rulesScale: Vector3 = new Vector3(5, 3.2, 0.05)

    constructor(messageBus: MessageBus, position: Vector3) {
        this.messageBus = messageBus

        this.container = new Entity()
        this.container.addComponent(new Transform({ position: position }))
        engine.addEntity(this.container)

        this.screen = new Entity()
        this.title = new Entity()
        this.borderModel = new GLTFShape('models/glassAngles.glb')

        this.Init()
    }
    Init = () => {
        this.BuildScreen()
        this.BuildBorders()
        this.BuildTexts()
        this.BuildButtons()
        this.BuildToggleEvent()
    }
    // -----------------------------------------------------------------------------------------------------------------
    private BuildToggleEvent = () => {
        this.container.addComponent(new ToggleComponent(ToggleState.On,(value: ToggleState) => {
            const newScale = value ? this.queueScale : this.rulesScale

            this.title.getComponent(TextShape).opacity = 0

            this.screen.addComponentOrReplace(new ScaleTransformComponent(this.screen.getComponent(Transform).scale, newScale, this.animationDuration, () => {
                const titleText = new TextShape(value ? "---- QUEUE ----" : "---- RULES ----")
                titleText.fontSize = 2
                this.title.addComponentOrReplace(titleText)
                this.title.getComponent(Transform).position = this.titlePosition(newScale)
            }))
            this.screen.addComponentOrReplace(new MoveTransformComponent(this.screen.getComponent(Transform).position, new Vector3(0, newScale.y / 2, 0), this.animationDuration))

            this.borderTopLeft?.addComponentOrReplace(new MoveTransformComponent(
                this.borderTopLeft?.getComponent(Transform).position,
                this.positionTopLeft(newScale),
                this.animationDuration
            ))
            this.borderTopRight?.addComponentOrReplace(new MoveTransformComponent(
                this.borderTopRight?.getComponent(Transform).position,
                this.positionTopRight(newScale),
                this.animationDuration
            ))
            this.borderBotLeft?.addComponentOrReplace(new MoveTransformComponent(
                this.borderBotLeft?.getComponent(Transform).position,
                this.positionBotLeft(newScale),
                this.animationDuration
            ))
            this.borderBotRight?.addComponentOrReplace(new MoveTransformComponent(
                this.borderBotRight?.getComponent(Transform).position,
                this.positionBotRight(newScale),
                this.animationDuration
            ))
        }))
    }
    // -----------------------------------------------------------------------------------------------------------------
    private positionTopLeft(screenScale: Vector3): Vector3 {
        return new Vector3(screenScale.x / 2, screenScale.y, 0)
    }
    private positionTopRight(screenScale: Vector3): Vector3 {
        return new Vector3(-(screenScale.x / 2), screenScale.y, 0)
    }
    private positionBotLeft(screenScale: Vector3): Vector3 {
        return new Vector3(screenScale.x / 2, 0, 0)
    }
    private positionBotRight(screenScale: Vector3): Vector3 {
        return new Vector3(-(screenScale.x / 2), 0, 0)
    }
    private titlePosition(screenScale: Vector3) : Vector3{
        return new Vector3(0, screenScale.y - this.titleOffsetTop, 0.05)
    }
    // -----------------------------------------------------------------------------------------------------------------
    BuildScreen = () => {
        this.screen.addComponentOrReplace(new BoxShape())
        this.screen.addComponentOrReplace(new Transform({
            position: new Vector3(0, this.queueScale.y / 2, 0),
            scale: this.queueScale
        }))
        const screenMaterial = new Material()
        screenMaterial.albedoColor = new Color4(0.65, 0.90, 0.95, 0.4)
        screenMaterial.metallic = 0.5
        screenMaterial.roughness = 0.1
        this.screen.addComponentOrReplace(screenMaterial)
        this.screen.setParent(this.container)
    }
    // -----------------------------------------------------------------------------------------------------------------
    BuildTexts = () => {
        const titleText = new TextShape("---- QUEUE ----")
        titleText.fontSize = 2
        this.title.addComponent(titleText)
        this.title.addComponent(new Transform({
            position: this.titlePosition(this.queueScale)
        }))
        this.title.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 180, 0)

        this.title.setParent(this.container)
    }
    // -----------------------------------------------------------------------------------------------------------------
    BuildBorders = () => {
        this.borderTopLeft = new Entity()
        this.borderTopLeft.addComponent(this.borderModel)
        this.borderTopLeft.addComponent(new Transform({
            position: this.positionTopLeft(this.queueScale),
        }))
        this.borderTopLeft.getComponent(Transform).rotation.eulerAngles = new Vector3(0, -90, 0)
        this.borderTopLeft.setParent(this.container)
        // -----------------------------------------
        this.borderTopRight = new Entity()
        this.borderTopRight.addComponent(this.borderModel)
        this.borderTopRight.addComponent(new Transform({
            position: this.positionTopRight(this.queueScale),
        }))
        this.borderTopRight.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 0)
        this.borderTopRight.setParent(this.container)
        // -----------------------------------------
        this.borderBotLeft = new Entity()
        this.borderBotLeft.addComponent(this.borderModel)
        this.borderBotLeft.addComponent(new Transform({
            position: this.positionBotLeft(this.queueScale),
        }))
        this.borderBotLeft.getComponent(Transform).rotation.eulerAngles = new Vector3(0, -90, -180)
        this.borderBotLeft.setParent(this.container)
        // -----------------------------------------
        this.borderBotRight = new Entity()
        this.borderBotRight.addComponent(this.borderModel)
        this.borderBotRight.addComponent(new Transform({
            position: this.positionBotRight(this.queueScale),
        }))
        this.borderBotRight.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 180)
        this.borderBotRight.setParent(this.container)
    }
    // -----------------------------------------------------------------------------------------------------------------
    BuildButtons = () => {
        const playBtn = new Entity()
        playBtn.addComponent(new BoxShape())
        playBtn.addComponent(new Transform({
            scale: new Vector3(0.5, 0.15, 0.3),
            position: new Vector3(0.4, 0, 1),
        }))
        playBtn.getComponent(Transform).rotation.eulerAngles = new Vector3(40, 0, 0)
        playBtn.addComponent(new OnPointerDown(() => {
            log('play click')
        }, {
            button: ActionButton.POINTER,
            showFeedback: true,
            hoverText: "Play",
        }))
        playBtn.setParent(this.container)
        // -------------------------------------------------
        // -------------------------------------------------
        const infosBtn = new Entity()
        infosBtn.addComponent(new BoxShape())
        infosBtn.addComponent(new Transform({
            scale: new Vector3(0.5, 0.15, 0.3),
            position: new Vector3(-0.4, 0, 1),
        }))
        infosBtn.getComponent(Transform).rotation.eulerAngles = new Vector3(40, 0, 0)
        infosBtn.addComponent(new OnPointerDown(() => {
            log('rules click')
            this.container.getComponent(ToggleComponent).toggle()
        }, {
            button: ActionButton.POINTER,
            showFeedback: true,
            hoverText: "Rules",
        }))
        infosBtn.setParent(this.container)
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
