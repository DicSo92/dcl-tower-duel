import {
    MoveTransformComponent,
    ScaleTransformComponent,
    ToggleComponent,
    ToggleState
} from "@dcl/ecs-scene-utils";
import { getUserData } from "@decentraland/Identity";
import LobbyScreenBorder from "@/lobbyScreenBorder";

export default class LobbyScreen implements ISystem {
    messageBus: MessageBus

    container: Entity
    screen: Entity
    title: Entity
    borderTopLeft?: Entity
    borderTopRight?: Entity
    borderBotLeft?: Entity
    borderBotRight?: Entity

    animationDuration: number = 0.6
    titleOffsetTop: number = 0.55
    queueTitle: string = "---- QUEUE ----"
    rulesTitle: string = "---- RULES ----"
    queueScale: Vector3 = new Vector3(2.75, 3, 0.05)
    rulesScale: Vector3 = new Vector3(5, 3.2, 0.05)

    constructor(messageBus: MessageBus, position: Vector3) {
        this.messageBus = messageBus

        this.container = new Entity()
        this.container.addComponent(new Transform({ position: position }))
        engine.addEntity(this.container)

        this.screen = new Entity()
        this.title = new Entity()
        this.title.setParent(this.container)

        this.Init()
    }
    Init = () => {
        this.BuildScreen()
        this.BuildBorders()
        this.BuildButtons()
        this.BuildToggleEvent()
        this.setTitleText(this.queueScale, this.queueTitle)
    }
    // -----------------------------------------------------------------------------------------------------------------
    private BuildToggleEvent = () => {
        this.container.addComponent(new ToggleComponent(ToggleState.On,(value: ToggleState) => {
            const newScale = value ? this.queueScale : this.rulesScale

            this.title.getComponent(TextShape).opacity = 0

            this.screen.addComponentOrReplace(new ScaleTransformComponent(this.screen.getComponent(Transform).scale, newScale, this.animationDuration, () => {
                this.setTitleText(newScale, value ? this.queueTitle : this.rulesTitle)

                const titleText = new TextShape(value ? this.queueTitle : this.rulesTitle)
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
    async getUser() {
        try {
            let data = await getUserData()
            log('zzzzzzzzzzzzzzzzzzzzzzz')
            log(data)
            log('zzzzzzzzzzzzzzzzzzzzzzz')
        } catch {
            log("Failed to get user")
        }
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
    private setTitleText (screenScale: Vector3, text: string) {
        const titleText = new TextShape(text)
        titleText.fontSize = 2
        this.title.addComponentOrReplace(titleText)
        this.title.addComponentOrReplace(new Transform({
            position: this.titlePosition(screenScale)
        }))
        this.title.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 180, 0)
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
    BuildBorders = () => {
        this.borderTopLeft = new LobbyScreenBorder(this, this.messageBus, this.positionTopLeft(this.queueScale), new Vector3(0, -90, 0))
        // -----------------------------------------
        this.borderTopRight = new LobbyScreenBorder(this, this.messageBus, this.positionTopRight(this.queueScale), new Vector3(0, 90, 0))
        // -----------------------------------------
        this.borderBotLeft = new LobbyScreenBorder(this, this.messageBus, this.positionBotLeft(this.queueScale), new Vector3(0, -90, -180))
        // -----------------------------------------
        this.borderBotRight = new LobbyScreenBorder(this, this.messageBus, this.positionBotRight(this.queueScale), new Vector3(0, 90, 180))
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
        playBtn.addComponent(new OnPointerDown(async () => {
            log('play click')
            await this.getUser()
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
