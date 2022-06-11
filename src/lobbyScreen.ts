import {
    MoveTransformComponent,
    ScaleTransformComponent,
    ToggleComponent,
    ToggleState
} from "@dcl/ecs-scene-utils";
import Game from "./game";
import { getUserData } from "@decentraland/Identity"
import { movePlayerTo } from "@decentraland/RestrictedActions";
import { IUser } from "./interfaces/class.interface";

export default class LobbyScreen implements ISystem {
    parent: Game

    container: Entity
    screen: Entity
    borderModel: GLTFShape
    title: Entity
    content: Entity
    borderTopLeft?: Entity
    borderTopRight?: Entity
    borderBotLeft?: Entity
    borderBotRight?: Entity

    animationDuration: number = 0.6
    titleOffsetTop: number = 0.55
    queueTitle: string = `---- QUEUE ----`
    usersInQueue: Array<IUser> = []
    rulesTitle: string = `---- RULES ----\n
        Click on play button\n
        Wait to be in game\n
        Click on the green button to start the game\n
        Click on red button to stop the block\n
        Try to stop the block as much as possible in line with the previous block and build the higher tower\n
        Cast spells\n
            key 1/ Remove last 3 blocks\n
            key 2/ Decrease speed for x secondes\n
            key 3/ Increase margin error for x secondes\n
            \n` //key 4/
    queueScale: Vector3 = new Vector3(2.75, 3, 0.05)
    rulesScale: Vector3 = new Vector3(5, 3.2, 0.05)
    playBtn: Entity = new Entity();
    rulesBtn: Entity = new Entity();
    usersInGame: Array<IUser> = []

    constructor(parent: Game, position: Vector3) {
        this.parent = parent

        this.container = new Entity()
        this.container.addComponent(new Transform({ position: position }))
        engine.addEntity(this.container)

        this.screen = new Entity()
        this.title = new Entity()
        this.title.setParent(this.container)
        this.content = new Entity()
        this.content.setParent(this.container)
        this.borderModel = new GLTFShape('models/glassAngles.glb')

        this.Init()
    }
    Init = () => {
        this.BuildEvents()
        this.BuildScreen()
        this.BuildBorders()
        this.BuildButtons()
        this.BuildToggleEvent()
        this.setTitleText(this.queueScale, this.queueTitle)
    }

    // -----------------------------------------------------------------------------------------------------------------
    private BuildEvents() {
        this.parent.messageBus.emit('getUsersInGame', {})
        this.parent.messageBus.on('getUsersInGame', () => {
            if (this.usersInGame.length) {
                this.parent.messageBus.emit('setUsersInGame', { users: this.usersInGame })
            }
        })
        this.parent.messageBus.on('setUsersInGame', (users) => {
            if (users) {
                this.usersInGame = [...users]
            }
            log('usersInGame', this.usersInGame)
        })
        this.parent.messageBus.on('addUserInGame', (data) => {
            if (data) {
                this.usersInGame.push(data.user)
            }
            log('usersInGame', this.usersInGame)
        })
        this.parent.messageBus.on('removeUserInGame', (data) => {
            if (data) {
                this.usersInGame = this.usersInGame.filter((item: IUser) => item !== data.user)
            }
            log('usersInGame', this.usersInGame)
        })
        this.parent.messageBus.on('addPlayerInQueue', (user: IUser) => {
            if (user) {
                // log(user)
                // log(user.id, user.name)
                this.addUserInQueue(user)
                this.parent.mainGame0?.liftToGame.entity.getComponent(AudioSource).playOnce()
            }
        })
        this.parent.messageBus.on('newPlayer', (user) => {
            if (user) {
                // log(user)
                // log(user.id, user.name)
                // this.usersInWaiting.push(user.id, user.name)
                movePlayerTo(new Vector3(24, .1, 24), new Vector3(24, 0, 8))
                this.parent.mainGame0?.gameApprovalSolo('gameApprovalSolo')
                this.parent.mainGame0?.liftToGame.entity.getComponent(AudioSource).playOnce()
            }
        })
    }
    // -----------------------------------------------------------------------------------------------------------------
    private BuildToggleEvent = () => {
        this.container.addComponent(new ToggleComponent(ToggleState.On, (value: ToggleState) => {
            const newScale = value ? this.queueScale : this.rulesScale

            this.title.getComponent(TextShape).opacity = 0

            this.screen.addComponentOrReplace(new ScaleTransformComponent(this.screen.getComponent(Transform).scale, newScale, this.animationDuration, () => {
                this.setTitleText(newScale, value ? this.queueTitle : this.rulesTitle)

                const titleText = new TextShape(value ? this.queueTitle : this.rulesTitle)
                titleText.fontSize = newScale === this.queueScale ? 2 : 1
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
            log('USER DATA', data)
            this.parent.userId = data?.userId
            this.parent.userName = data?.displayName
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
        this.rulesBtn.addComponent(this.parent.sceneAssets.soundValide)
        this.rulesBtn.addComponent(new Transform({
            position: new Vector3(-0.6, 0, 1),
            scale: new Vector3(1, 1, 1)
        }))
        this.rulesBtn.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, -40)
        this.rulesBtn.addComponent(this.parent.sceneAssets.rulesBtn)
        const rbtnAnimator = new Animator()
        this.parent.sceneAssets.rulesBtnAnimStates.forEach(item => {
            if (item.clip === 'viberZBezier') {
                item.looping = true
            }
            else {
                item.looping = false
            }
            item.stop()
            rbtnAnimator.addClip(item)
        })
        this.rulesBtn.addComponent(rbtnAnimator)
        this.rulesBtn.getComponent(Animator).getClip('viberZBezier').play()

        this.rulesBtn.addComponent(new OnPointerDown(() => {
            log('rules click')
            this.rulesBtn.getComponent(Animator).getClip('viberBorderXLinear').play()
            this.rulesBtn.getComponent(Animator).getClip('viberZBezier').reset()
            this.rulesBtn.getComponent(Animator).getClip('viberZBezier').play()
            this.container.getComponent(ToggleComponent).toggle()
            this.rulesBtn.getComponent(AudioSource).playOnce()
        }, {
            button: ActionButton.POINTER,
            showFeedback: true,
            hoverText: "Rules",
        }))
        this.rulesBtn.setParent(this.container)

        // --------------------------------------------------------------------------
        this.playBtn.addComponent(this.parent.sceneAssets.soundClick)

        this.playBtn.addComponent(new Transform({
            position: new Vector3(0.6, 0, 1),
            scale: new Vector3(1, 1, 1)
        }))
        this.playBtn.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, -40)
        this.playBtn.addComponent(this.parent.sceneAssets.playBtn)
        const pbtnAnimator = new Animator()
        this.parent.sceneAssets.playBtnAnimStates.forEach(item => {
            if (item.clip === 'viberZBezier') {
                item.looping = true
            }
            else {
                item.looping = false
            }
            this.playBtn.getComponent(AudioSource).playOnce()
            pbtnAnimator.addClip(item)
        })
        this.playBtn.addComponent(pbtnAnimator)
        this.playBtn.getComponent(Animator).getClip('viberZBezier').play()

        this.playBtn.addComponent(new OnPointerDown(async () => {
            log('play click')
            this.playBtn.getComponent(Animator).getClip('viberBorderXLinear').play()
            this.playBtn.getComponent(Animator).getClip('viberZBezier').reset()
            this.playBtn.getComponent(Animator).getClip('viberZBezier').play()
            this.playBtn.getComponent(AudioSource).playOnce()
            if (this.parent.streamSource) this.parent.streamSource.getComponent(AudioStream).playing = false
            await this.getUser()
            log("result getUserData", { id: this.parent.userId, name: this.parent.userName })
            this.parent.messageBus.emit('addPlayerInQueue', { id: this.parent.userId, name: this.parent.userName })
        }, {
            button: ActionButton.POINTER,
            showFeedback: true,
            hoverText: "Play",
        }))
        this.playBtn.setParent(this.container)
    }

    addUserInQueue(user: IUser) {
        log("this.addUserInQueue", user)
        const userInQueue = this.usersInQueue.filter(item => item.id === user.id)
        log("userInQueue", userInQueue)
        if (userInQueue.length === 0) {
            this.usersInQueue.push(user)
            this.updateQueueScreen()
        } else {
            log('Already in Queue !')
        }
    }

    removeUserInQueue(user: IUser) {
        const condition = (item: IUser) => { return item.id === user.id && item.name === user.name }
        this.usersInQueue.forEach(element => {
            if (condition(element)) {
                this.usersInQueue.splice(this.usersInQueue.indexOf(element), 1)
            }
        })
        this.updateQueueScreen()
    }

    updateQueueScreen() {
        log(this.usersInQueue)
        let usersNames: string[] = []
        this.usersInQueue.forEach(element => {
            usersNames.push(element.name)
        });
        log("usersNames.join('\n')", usersNames.join('\n'))
        this.queueTitle = `---- QUEUE ----\n${usersNames.join('\n')}`
        this.setTitleText(this.queueScale, this.queueTitle)
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
