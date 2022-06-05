import { loadColliders } from "@/colliderSetup";
import { IGameAssets, ISceneAssets, IMainGame } from "@/interfaces/class.interface";
import MainGame from "@/mainGame";
import { getUserData } from "@decentraland/Identity"
import { GameAssets, SceneAssets } from "@/assets";
import * as utils from "@dcl/ecs-scene-utils";
import LobbyScreen from "@/lobbyScreen";

onSceneReadyObservable.add(() => {
    log("SCENE LOADED");
    const game = new Game()
    engine.addSystem(game);
});

export default class Game implements ISystem {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus
    gameAssets: IGameAssets
    sceneAssets: ISceneAssets
    mainGame0?: IMainGame
    mainGame1?: IMainGame
    usersInGame: Array<String> = []
    userId?: string
    rulesBtn: Entity = new Entity()
    playBtn: Entity = new Entity()

    constructor() {
        this.physicsMaterial = new CANNON.Material("groundMaterial")
        this.world = new CANNON.World()
        this.messageBus = new MessageBus()
        this.gameAssets = new GameAssets()
        this.sceneAssets = new SceneAssets()
        log("sceneAssets", this.sceneAssets.higherTowerModel)

        this.SetupWorldConfig()
        this.buildScene()
        this.BuildEvents()


        this.mainGame0 = new MainGame(this.physicsMaterial, this.world, this, this.messageBus, 'left')
        engine.addSystem(this.mainGame0)
        this.mainGame1 = new MainGame(this.physicsMaterial, this.world, this, this.messageBus, 'right')
        engine.addSystem(this.mainGame1)

        executeTask(async () => {
            let data = await getUserData()
            log(data)
            this.userId = data?.userId
        })
    }

    private SetupWorldConfig() {

        this.world.quatNormalizeSkip = 0
        this.world.quatNormalizeFast = false
        this.world.gravity.set(0, -9.82, 0) // m/s²
        loadColliders(this.world)
        const ballContactMaterial = new CANNON.ContactMaterial(this.physicsMaterial, this.physicsMaterial, { friction: 1, restitution: 0.33 })
        this.world.addContactMaterial(ballContactMaterial)

        // Create a ground plane and apply physics material
        const groundBody: CANNON.Body = new CANNON.Body({ mass: 0 })
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2) // Reorient ground plane to be in the y-axis

        groundBody.addShape(new CANNON.Plane())
        groundBody.material = this.physicsMaterial
        this.world.addBody(groundBody)

    }

    private buildScene() {
        const lobbyScreen = new LobbyScreen(this.messageBus, new Vector3(16, 1, 16))
        engine.addSystem(lobbyScreen)

        // const gameStarterPlot = new Entity()
        // gameStarterPlot.addComponent(new Transform({
        //     position: new Vector3(16, 0, 24),
        //     scale: new Vector3(1.5, 1.5, 1.5)
        // }))
        
        this.rulesBtn.addComponent(new Transform({
            position: new Vector3(15.25, 1, 17),
            scale: new Vector3(1, 1, 1)
        }))
        this.rulesBtn.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 0)
        this.rulesBtn.addComponent(this.sceneAssets.rulesBtn)
        const rbtnAnimator = new Animator()
        this.sceneAssets.rulesBtnAnimStates.forEach(item => {
            if (item.clip === 'stopped') {
                log("Play rulesBtn.stopped", item)
                item.looping = true
                // item.play()
                item.stop()
            }
            else {
                log("Play !rulesBtn.stopped", item)
                item.looping = true
                item.stop()
                // item.reset()
            }
            rbtnAnimator.addClip(item)
        })
        this.rulesBtn.addComponent(rbtnAnimator)
        engine.addEntity(this.rulesBtn)

        // this.rulesBtn.addComponentOrReplace(new utils.Delay(1000, () => {
            // log("Play rulesBtn.rotationYBezier")
            // this.rulesBtn.getComponent(Animator).getClip('rotationYBezier').play()
            // this.rulesBtn.getComponent(Animator).getClip('rotationZBezier').play()
            // this.rulesBtn.getComponent(Animator).getClip('rotationYLinear').play()
            // this.rulesBtn.getComponent(Animator).getClip('stopping').play()
            // log("Playing rulesBtn.rotationYBezier")
            // this.rulesBtn.getComponent(Animator).getClip('rotationYBezier').stop()
            // log("Stopping rulesBtn.rotationYBezier")
        // }))
        this.playBtn.addComponent(new Transform({
            position: new Vector3(16.75, 1, 17),
            scale: new Vector3(1, 1, 1)
        }))
        this.playBtn.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 0)
        this.playBtn.addComponent(this.sceneAssets.playBtn)
        const pbtnAnimator = new Animator()
        this.sceneAssets.rulesBtnAnimStates.forEach(item => {
            if (item.clip === 'stopped') {
                log("Play rulesBtn.stopped", item)
                item.looping = true
                // item.play()
                item.stop()
            } else if (item.clip === 'rotX') {
                log("Play rulesBtn.stopped", item)
                item.looping = true
                // item.play()
                item.stop()
            }
            else {
                log("Play !rulesBtn.stopped", item)
                item.looping = true
                item.stop()
                // item.reset()
            }
            pbtnAnimator.addClip(item)
        })
        this.playBtn.addComponent(pbtnAnimator)
        engine.addEntity(this.playBtn)

        this.playBtn.addComponentOrReplace(new utils.Delay(1000, () => {
            // log("Play rulesBtn.rotationYBezier")
            // this.rulesBtn.getComponent(Animator).getClip('rotationYBezier').play()
            // this.rulesBtn.getComponent(Animator).getClip('rotationZBezier').play()
            this.rulesBtn.getComponent(Animator).getClip('rotXBezier').play()
            // this.rulesBtn.getComponent(Animator).getClip('rotationYLinear').play()
            // this.rulesBtn.getComponent(Animator).getClip('stopping').play()
            // log("Playing rulesBtn.rotationYBezier")
            // this.rulesBtn.getComponent(Animator).getClip('rotationYBezier').stop()
            // log("Stopping rulesBtn.rotationYBezier")
        }))

        // const gameStarterPlot = new Entity()
        // gameStarterPlot.addComponent(new Transform({
        //     position: new Vector3(16, 0, 24),
        //     scale: new Vector3(1.5, 1.5, 1.5)
        // }))
        // gameStarterPlot.addComponent(this.sceneAssets.gameStarter)
        // const gspAnimator = new Animator()
        // this.sceneAssets.gameStarterAnimStates.forEach(item => {
        //     gspAnimator.addClip(item)
        //     item.reset()
        //     item.play()
        // })
        // gameStarterPlot.addComponent(gspAnimator)
        // engine.addEntity(gameStarterPlot)

        // this.BuildMobius(gameStarterPlot, true)
        // this.BuildMobius(gameStarterPlot, false)

        const higherTower = new Entity()
        higherTower.addComponent(new Transform({
            position: new Vector3(16, 0, 24),
            scale: new Vector3(1, 1, 1)
        }))
        higherTower.addComponent(this.sceneAssets.higherTowerModel)
        const htAnimator = new Animator()
        this.sceneAssets.higherTowerAnimStates.forEach(item => {
            htAnimator.addClip(item)
            item.reset()
            item.play()
        })
        higherTower.addComponent(htAnimator)
        engine.addEntity(higherTower)

        const povFloor = new Entity()
        povFloor.addComponent(new Transform({
            position: new Vector3(16, 0, 24),
            scale: new Vector3(1, 1, 1)
        }))
        povFloor.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 0)
        povFloor.addComponent(this.sceneAssets.povFloor)
        engine.addEntity(povFloor)
    }

    private BuildMobius(parent: Entity, left: boolean) {
        const mobius = new Entity()
        mobius.setParent(parent)
        mobius.addComponent(new Transform({
            position: left ? new Vector3(0, 2.25, -1.1) : new Vector3(0, 2.25, 1.1),
            scale: new Vector3(.05, .05, .05)
        }))
        mobius.addComponent(this.sceneAssets.mobius)
        const mbAnimator = new Animator()
        this.sceneAssets.mobiusAnimStates.forEach(item => {
            mbAnimator.addClip(item)
            item.reset()
            item.play()
        })
        mobius.addComponent(mbAnimator)
        this.MobiusRotation(mobius, left ? 'fluid' : '') // 'fuilde'; 'sacade'
    }

    private MobiusRotation(mobiusLeft: Entity, type?: string) {
        let addedAngle = { x: 0, y: 0, z: 0 }

        if (type === 'sacade') {
            addedAngle.x = 90
            addedAngle.y = 90
            addedAngle.z = 45
        } else if (type === 'fluid') {
            addedAngle.x = 45
            addedAngle.y = 45
            addedAngle.z = - 90
        } else {
            addedAngle.x = 45
            addedAngle.y = 45
            addedAngle.z = - 45
        }

        const start = mobiusLeft.getComponent(Transform).rotation
        const end = Quaternion.Euler(
            mobiusLeft.getComponent(Transform).rotation.eulerAngles.x + addedAngle.x,
            mobiusLeft.getComponent(Transform).rotation.eulerAngles.y + addedAngle.y,
            mobiusLeft.getComponent(Transform).rotation.eulerAngles.z + addedAngle.z
        )

        mobiusLeft.addComponentOrReplace(new utils.RotateTransformComponent(start, end, 2, () => {
            this.MobiusRotation(mobiusLeft, type)
        }))
    }

    private BuildEvents() {
        this.messageBus.emit('getUsersInGame', {})
        this.messageBus.on('getUsersInGame', () => {
            if (this.usersInGame.length) {
                this.messageBus.emit('setUsersInGame', { users: this.usersInGame })
            }
        })
        this.messageBus.on('setUsersInGame', (users) => {
            if (users) {
                this.usersInGame = [...users]
            }
            log('usersInGame', this.usersInGame)
        })
        this.messageBus.on('addUserInGame', (data) => {
            if (data) {
                this.usersInGame.push(data.user)
            }
            log('usersInGame', this.usersInGame)
        })
        this.messageBus.on('removeUserInGame', (data) => {
            if (data) {
                this.usersInGame = this.usersInGame.filter((item: String) => item !== data.user)
            }
            log('usersInGame', this.usersInGame)
        })
    }

    update(dt: number): void {
    }
}
