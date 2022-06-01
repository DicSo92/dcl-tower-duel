import { loadColliders } from "@/colliderSetup";
import { IGameAssets, ISceneAssets, IMainGame } from "@/interfaces/class.interface";
import MainGame from "@/mainGame";
import { getUserData } from "@decentraland/Identity"
import { GameAssets, SceneAssets } from "@/assets";

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

    constructor() {
        this.physicsMaterial = new CANNON.Material("groundMaterial")
        this.world = new CANNON.World()
        this.messageBus = new MessageBus()
        this.gameAssets = new GameAssets()
        this.sceneAssets = new SceneAssets()
        log("assetsScene", this.sceneAssets.higherTowerModel)

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
        const gameStarterPlot = new Entity()
        gameStarterPlot.addComponent(new Transform({
            position: new Vector3(16, 0, 24),
            scale: new Vector3(1.5, 1.5, 1.5)
        }))
        gameStarterPlot.addComponent(this.sceneAssets.gameStarter)
        const gspAnimator = new Animator()
        this.sceneAssets.gameStarterAnimStates.forEach(item => {
            gspAnimator.addClip(item)
            item.reset()
            item.play()
        })
        gameStarterPlot.addComponent(gspAnimator)
        engine.addEntity(gameStarterPlot)

        const higherTower = new Entity()
        higherTower.addComponent(new Transform({
            position: new Vector3(8, 0, 24),
            scale: new Vector3(1,1,1)
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
        // const blueButton = new BlueButton(new Transform({
        //     position: new Vector3(25, 1.1, 18),
        //     rotation: new Quaternion(0, 0, 0, 1),
        //     scale: new Vector3(2, 2, 2)
        // }), this.messageBus);

        // engine.addSystem(blueButton);
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
