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
import LobbyScreenBorder from "@/lobbyScreenBorder";
import { getCurrentRealm } from "@decentraland/EnvironmentAPI";

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

        await this.getUser()
        await this.getRealm()
        this.BuildEvents()
        this.BuildScreen()
        this.BuildBorders()
        this.BuildButtons()
        this.BuildToggleEvent()
        this.setTitleText(this.queueScale, this.queueTitle)
    }

    // -----------------------------------------------------------------------------------------------------------------
    private BuildEvents() {
        // -------------------------------------------------------
        this.parent.messageBus.on('setData_' + this.parent.user.public_address, (data: { usersInQueue: IUser[], usersInGame: { left: IUser, right: IUser }, lastUpdate: number }) => {
            log("onSetData")
            if (!this.gameLastUpdate || this.gameLastUpdate < data.lastUpdate) {
                this.usersInQueue = data.usersInQueue
                this.usersInGame = data.usersInGame
                this.gameLastUpdate = data.lastUpdate
                this.queueLastUpdate = data.lastUpdate
            }
            log("this.usersInQueue", this.usersInQueue)
            log("this.usersInGame", this.usersInGame)
        })
        this.parent.messageBus.emit('getData_' + this.parent.user.realm, { user: this.parent.user })
        this.parent.messageBus.on('getData_' + this.parent.user.realm, (data: { user: IUser }) => {
            log("onGetData", this.usersInGame)
            log("user", data.user)
            log("user.public_address", data.user.public_address)
            this.parent.messageBus.emit('setData_' + data.user.public_address, { usersInQueue: this.usersInQueue, usersInGame: this.usersInGame, lastUpdate: this.queueLastUpdate })
        })
        log(this.usersInQueue)
        log(this.usersInGame)
        // -------------------------------------------------------
        // Event when player leaves scene
        onLeaveSceneObservable.add((player) => {
            log("player left scene: ", player.userId)
            if (player.userId === this.usersInGame.left.public_address) {
                this.usersInGame.left.public_address === ""
                this.usersInGame.left.name === ""
                this.usersInGame.left.realm === ""
            } else if (player.userId === this.usersInGame.right.public_address) {
                this.usersInGame.left.public_address === ""
                this.usersInGame.left.name === ""
                this.usersInGame.left.realm === ""
            }
        })
        // -------------------------------------------------------
        // this.parent.messageBus.emit('getUsersInQueue', { data: { users: this.usersInQueue, lastUpdate: this.queueLastUpdate } })
        // this.parent.messageBus.on('getUsersInQueue', (data: { users: IUser[], lastUpdate: number }) => {
        //     if (this.usersInQueue !== data.users && data.lastUpdate > this.queueLastUpdate) {
        //         this.parent.messageBus.emit('addUsersInQueue', { users: data.users, lastUpdate: this.queueLastUpdate })
        //     }
        // })
        // -------------------------------------------------------
        // log("this.usersInGame before emitGetUsersInGame", this.usersInGame)
        // this.parent.messageBus.emit('getUsersInGame', { data: { usersInGame: this.usersInGame, lastUpdate: this.gameLastUpdate } })
        // this.parent.messageBus.on('getUsersInGame', (data: { usersInGame: { left: IUser, right: IUser }, lastUpdate: number }) => {
        //     log("onGetUsersInGame")
        //     log("onGetUsersInGame.input.data.userInGame", data.usersInGame)
        //     log("this.usersInGame", this.usersInGame)
        //     const leftCondition = this.usersInGame.left.public_address !== data.usersInGame.left.public_address
        //     log("leftCondition", leftCondition)
        //     const rightCondition = this.usersInGame.right.public_address !== data.usersInGame.right.public_address
        //     log("rightCondition", rightCondition)
        //     if ((leftCondition || rightCondition) && this.gameLastUpdate && data.lastUpdate > this.gameLastUpdate) {
        //         this.parent.messageBus.emit('addUsersInGame', { usersInGame: this.usersInGame, lastUpdate: this.gameLastUpdate })
        //     } else if (!this.gameLastUpdate) this.gameLastUpdate = Date.now()
        // })
        // -------------------------------------------------------
        // this.parent.messageBus.on('addUsersInGame', (data) => {
        //     if (data) {
        //         if (this.usersInGame !== data.usersInGame && this.gameLastUpdate && data.lastUpdate > this.gameLastUpdate) {
        //             this.usersInGame = data.usersInGame
        //             this.gameLastUpdate = data.lastUpdate
        //         }
        //     }
        //     log('usersInGame', this.usersInGame)
        // })
        this.parent.messageBus.on('addUserInGame', (data: { user: IUser, side: string, lastUpdate: number }) => {
            if (data) {
                if (data.side === 'left') {
                    this.usersInGame.left = data.user
                } else if (data.side === 'right') {
                    this.usersInGame.right = data.user
                }
            }
            log('usersInGame', this.usersInGame)
        })
        // -------------------------------------------------------
        this.parent.messageBus.on('removeUserInGame', (data) => {
            if (data) {
                if (this.usersInGame.left.public_address === data.user.public_address) {
                    this.usersInGame.left.name = ""
                    this.usersInGame.left.public_address = ""
                    this.usersInGame.left.realm = ""
                } else if (this.usersInGame.right.public_address === data.user.public_address) {
                    this.usersInGame.left.name = ""
                    this.usersInGame.left.public_address = ""
                    this.usersInGame.left.realm = ""
                }
            }
            log('usersInGame', this.usersInGame)
        })
        // this.parent.messageBus.on('addUsersInQueue', (users: IUser[], lastUpdate: number) => {
        //     if (users && lastUpdate > this.queueLastUpdate) {
        //         this.addUsersInQueue(users)
        //         this.parent.mainGame0?.liftToGame.entity.getComponent(AudioSource).playOnce()
        //     }
        // })
        // this.parent.messageBus.on('addUserInQueue', (user: IUser) => {
        //     if (user) {
        //         // log(user)
        //         // log(user.public_address, user.name)
        //         this.addUserInQueue(user)
        //         this.parent.mainGame0?.liftToGame.entity.getComponent(AudioSource).playOnce()
        //     }
        // })
        // -------------------------------------------------------
        this.parent.messageBus.on('newGame_' + this.parent.user.public_address, (user) => {
            if (user) {
                log("newGame_" + this.parent.user.public_address)
                log(user)
                log(user.public_address, user.name)
                log(this.usersInGame)
                log(this.usersInGame.left.public_address)
                // this.usersInWaiting.push(user.public_address, user.name)
                if (this.usersInGame.left.public_address === "") {
                    log("this.usersInGame.left.public_address empty")
                    this.parent.mainGame0?.modeSelection('left')
                    this.parent.mainGame0?.liftToGame.entity.getComponent(AudioSource).playOnce()
                } else if (this.usersInGame.right.public_address === "") {
                    log("this.usersInGame.right.public_address empty")
                    this.parent.mainGame1?.modeSelection('right')
                    this.parent.mainGame1?.liftToGame.entity.getComponent(AudioSource).playOnce()
                }
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
            if (data) this.parent.user = { public_address: data.userId, name: data.displayName }
        } catch {
            log("Failed to get user")
        }
    }
    async getRealm() {
        try {
            let realm = await getCurrentRealm()
            log('REALM DATA', realm)
            if (realm) this.parent.user.realm = realm.domain
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
            // log("result getUserData", { id: this.parent.user.public_address, name: this.parent.user.name })
            // this.parent.messageBus.emit('addUserInQueue', { id: this.parent.user.public_address, name: this.parent.user.name })
            this.parent.messageBus.emit('newGame_' + this.parent.user.public_address, this.parent.user)
        }, {
            button: ActionButton.POINTER,
            showFeedback: true,
            hoverText: "Play",
        }))
        this.playBtn.setParent(this.container)
    }

    addUserInQueue(user: IUser) {
        log("this.addUserInQueue", user)
        const userInQueue = this.usersInQueue.filter(value => value.public_address === user.public_address)
        if (userInQueue.length === 0) {
            log("userInQueue", userInQueue)
            this.usersInQueue.push(user)
            this.updateQueueScreen()
        } else {
            log('Already in Queue !')
        }
    }

    addUsersInQueue(users: IUser[]) {
        log("this.addUserInQueue", users)
        log("userInQueue", this.usersInQueue)
        if (users.length !== 0) {
            this.usersInQueue = users
            this.updateQueueScreen()
        } else {
            log('Already in Queue !')
        }
    }

    removeUserInQueue(user: IUser) {
        const condition = (item: IUser) => { return item.public_address === user.public_address && item.name === user.name }
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
