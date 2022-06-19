import {
    InterpolationType,
    MoveTransformComponent,
    ScaleTransformComponent,
    ToggleComponent,
    ToggleState,
} from "@dcl/ecs-scene-utils";
import Game from "./game";
import { getUserData } from "@decentraland/Identity"
import { IUser } from "./interfaces/class.interface";
import LobbyScreenBorder from "@/lobbyScreenBorder";
import { getCurrentRealm } from "@decentraland/EnvironmentAPI";
import { UserConnection } from "./userConnection";

export default class LobbyScreen implements ISystem {
    parent: Game
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
    queueLastUpdate: number = Date.now()
    gameLastUpdate?: number
    queueTitle: string = `---- QUEUE ----`
    usersInQueue: Array<IUser> = []
    rulesTitle: string = ""
    rulesImage: Entity = new Entity()
    queueScale: Vector3 = new Vector3(2.75, 3, 0.05)
    rulesScale: Vector3 = new Vector3(5, 3.2, 0.05)
    playBtn: Entity = new Entity();
    queueBtn: Entity = new Entity();
    usersInGame: { left: IUser, right: IUser } = { left: { public_address: "", name: "" }, right: { public_address: "", name: "" } }

    constructor(parent: Game, position: Vector3) {
        this.parent = parent
        this.messageBus = parent.messageBus

        this.container = new Entity()
        this.container.addComponent(new Transform({ position: position }))
        engine.addEntity(this.container)

        this.screen = new Entity()
        this.title = new Entity()
        this.title.setParent(this.container)

        this.Init()
    }
    Init = async () => {
        this.BuildEvents()
        this.BuildScreen()
        this.BuildBorders()
        this.BuildButtons()
        this.BuildToggleEvent()
        this.setTitleText(this.rulesScale, this.rulesTitle)
    }

    // -----------------------------------------------------------------------------------------------------------------
    private BuildEvents() {
        this.parent.userConnection = new UserConnection(this)
    }
    // -----------------------------------------------------------------------------------------------------------------
    private BuildToggleEvent = () => {
        this.container.addComponent(new ToggleComponent(ToggleState.Off, (value: ToggleState) => {
            const newScale = value ? this.queueScale : this.rulesScale

            this.title.getComponent(TextShape).opacity = 0
            this.rulesImage.getComponent(PlaneShape).visible = false

            this.screen.addComponentOrReplace(new ScaleTransformComponent(this.screen.getComponent(Transform).scale, newScale, this.animationDuration, () => {
                if (value) {
                    this.setTitleText(newScale, this.queueTitle)

                    const titleText = new TextShape(this.queueTitle)
                    titleText.fontSize = 2
                    this.title.addComponentOrReplace(titleText)
                    this.title.getComponent(Transform).position = this.titlePosition(newScale)
                } else {
                    this.rulesImage.getComponent(PlaneShape).visible = true
                }

            }, InterpolationType.EASEELASTIC))
            this.screen.addComponentOrReplace(new MoveTransformComponent(this.screen.getComponent(Transform).position, new Vector3(0, newScale.y / 2, 0), this.animationDuration, () => { }, InterpolationType.EASEELASTIC))

            this.borderTopLeft?.addComponentOrReplace(new MoveTransformComponent(
                this.borderTopLeft?.getComponent(Transform).position,
                this.positionTopLeft(newScale),
                this.animationDuration,
                () => { }, InterpolationType.EASEELASTIC
            ))
            this.borderTopRight?.addComponentOrReplace(new MoveTransformComponent(
                this.borderTopRight?.getComponent(Transform).position,
                this.positionTopRight(newScale),
                this.animationDuration,
                () => { }, InterpolationType.EASEELASTIC
            ))
            this.borderBotLeft?.addComponentOrReplace(new MoveTransformComponent(
                this.borderBotLeft?.getComponent(Transform).position,
                this.positionBotLeft(newScale),
                this.animationDuration,
                () => { }, InterpolationType.EASEELASTIC
            ))
            this.borderBotRight?.addComponentOrReplace(new MoveTransformComponent(
                this.borderBotRight?.getComponent(Transform).position,
                this.positionBotRight(newScale),
                this.animationDuration,
                () => { }, InterpolationType.EASEELASTIC
            ))
        }))
    }
    async getUser() {
        try {
            let data = await getUserData()
            if (data && this.parent.userConnection?.userData) this.parent.userConnection.userData = { public_address: data.userId, name: data.displayName }
        } catch {
            log("Failed to get user")
        }
    }
    async getRealm() {
        try {
            let realm = await getCurrentRealm()
            if (realm && this.parent.userConnection?.userData) this.parent.userConnection.userData.realm = realm.domain
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
    private titlePosition(screenScale: Vector3): Vector3 {
        return new Vector3(0, (screenScale === this.queueScale ? (screenScale.y - this.titleOffsetTop) : (screenScale.y - this.titleOffsetTop) / 2), 0.05)
    }
    // -----------------------------------------------------------------------------------------------------------------
    private setTitleText(screenScale: Vector3, text: string) {
        const titleText = new TextShape(text)
        titleText.fontSize = screenScale === this.queueScale ? 2 : 1
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
            position: new Vector3(0, this.rulesScale.y / 2, 0),
            scale: this.rulesScale
        }))
        const screenMaterial = new Material()
        screenMaterial.albedoColor = new Color4(0.65, 0.90, 0.95, 0.4)
        screenMaterial.metallic = 0.5
        screenMaterial.roughness = 0.1
        this.screen.addComponentOrReplace(screenMaterial)
        this.screen.setParent(this.container)

        this.rulesImage.addComponent(new PlaneShape())
        const screenTextMaterial = new BasicMaterial()
        screenTextMaterial.texture = new Texture("images/Rules.png")
        this.rulesImage.addComponent(screenTextMaterial)
        this.rulesImage.addComponent(new Transform({
            position: new Vector3(0, 0.02, 0.75),
            scale: new Vector3(0.85, 0.85, 0.85)
        }))
        this.rulesImage.getComponent(Transform).rotation.eulerAngles = new Vector3(180, 0, 0)
        this.rulesImage.setParent(this.screen)
    }
    // -----------------------------------------------------------------------------------------------------------------
    BuildBorders = () => {
        this.borderTopLeft = new LobbyScreenBorder(this, this.messageBus, this.positionTopLeft(this.rulesScale), new Vector3(0, -90, 0))
        // -----------------------------------------
        this.borderTopRight = new LobbyScreenBorder(this, this.messageBus, this.positionTopRight(this.rulesScale), new Vector3(0, 90, 0))
        // -----------------------------------------
        this.borderBotLeft = new LobbyScreenBorder(this, this.messageBus, this.positionBotLeft(this.rulesScale), new Vector3(0, -90, -180))
        // -----------------------------------------
        this.borderBotRight = new LobbyScreenBorder(this, this.messageBus, this.positionBotRight(this.rulesScale), new Vector3(0, 90, 180))
    }
    // -----------------------------------------------------------------------------------------------------------------
    BuildButtons = () => {
        this.queueBtn.addComponent(this.parent.sceneAssets.soundValide)
        this.queueBtn.addComponent(new BoxShape())
        this.queueBtn.addComponent(new Transform({
            position: new Vector3(-0.6, -0.1, 0.9),
            scale: new Vector3(1.1, 0.5, 0.2)
        }))
        this.queueBtn.getComponent(Transform).rotation.eulerAngles = new Vector3(-25, 0, 0)
        this.queueBtn.addComponentOrReplace(this.parent.sceneAssets.transparentMaterial)

        this.queueBtn.addComponent(new OnPointerDown(() => {
            this.parent.globalScene.getComponent(Animator).getClip('BtnQueueBorderAction').looping = false
            this.parent.globalScene.getComponent(Animator).getClip('BtnQueueBorderAction').play()
            this.container.getComponent(ToggleComponent).toggle()
            this.queueBtn.getComponent(AudioSource).playOnce()
        }, {
            button: ActionButton.POINTER,
            showFeedback: true,
            hoverText: "Rules",
        }))
        this.queueBtn.setParent(this.container)


        // --------------------------------------------------------------------------
        this.playBtn.addComponent(this.parent.sceneAssets.soundClick)

        this.playBtn.addComponent(new BoxShape())
        this.playBtn.addComponent(new Transform({
            position: new Vector3(0.6, -0.1, 0.9),
            scale: new Vector3(1.1, 0.5, 0.2)
        }))
        this.playBtn.getComponent(Transform).rotation.eulerAngles = new Vector3(-25, 0, 0)

        this.playBtn.addComponentOrReplace(this.parent.sceneAssets.transparentMaterial)

        this.playBtn.addComponent(new OnPointerDown(async () => {
            this.parent.globalScene.getComponent(Animator).getClip('BtnPlayBorderAction').looping = false
            this.parent.globalScene.getComponent(Animator).getClip('BtnPlayBorderAction').play()
            this.playBtn.getComponent(AudioSource).playOnce()
            const data = { user: this.parent.userConnection?.getUserData() }
            this.parent.userConnection?.socket?.send(JSON.stringify({ event: 'userClickToPlay', data: data }))
        }, {
            button: ActionButton.POINTER,
            showFeedback: true,
            hoverText: "Play",
        }))
        this.playBtn.setParent(this.container)
    }

    addUserInQueue(user: IUser) {
        const userInQueue = this.usersInQueue.filter(value => value.public_address === user.public_address)
        if (userInQueue.length === 0) {
            this.usersInQueue.push(user)
            this.updateQueueScreen()
        } else {
            log('Already in Queue !')
        }
    }

    updateQueue(users: IUser[]) {
        if (users.length !== 0) {
            this.usersInQueue = users
            this.updateQueueScreen()
        } else {
            log('Already in Queue !')
        }
    }

    removeUserInGame(user: IUser) {
        const condition = (item: IUser) => { return item.public_address === user.public_address }
        if (condition(this.usersInGame.left)) {
            this.usersInGame.left = { name: "", public_address: "", realm: "" }
        } else if (condition(this.usersInGame.right)) {
            this.usersInGame.right = { name: "", public_address: "", realm: "" }
        }
    }

    removeUserInQueue(user: IUser) {
        log("removeUserInQueue")
        const condition = (item: IUser) => { return item.public_address === user.public_address && item.name === user.name }
        this.usersInQueue.forEach(element => {
            if (condition(element)) {
                log("removeUserInQueue", element, user)
                log("this.usersInQueue before removing user", this.usersInQueue)
                this.usersInQueue.splice(this.usersInQueue.indexOf(element), 1)
                log("this.usersInQueue before removing user", this.usersInQueue)
            }
        })
        this.updateQueueScreen()
    }

    updateQueueScreen() {
        let usersNames: string[] = []
        this.usersInQueue.forEach(element => {
            usersNames.push(element.name)
        });
        log("updateQueueScreen")
        log("this.usersInQueue", this.usersInQueue)
        log("usersNames", usersNames)
        this.queueTitle = `---- QUEUE ----\n${usersNames.join('\n')}`
        log("this.queueTitle", this.queueTitle)

        this.setTitleText(this.queueScale, this.queueTitle)
        if (!this.container.getComponent(ToggleComponent).isOn()) {
            this.container.getComponent(ToggleComponent).toggle()
        }
    }

    update(dt: number) { }
}
