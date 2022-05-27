import { loadColliders } from "@/colliderSetup";
import { IMainGame } from "@/interfaces/class.interface";
import MainGame from "@/mainGame";
import { getUserData } from "@decentraland/Identity"
import Assets from "@/assets";

onSceneReadyObservable.add(() => {
    log("SCENE LOADED");
    const game = new Game()
    engine.addSystem(game);
});


export default class Game implements ISystem {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus
    assets: Assets
    mainGame?: IMainGame
    usersInGame: Array<String> = []
    userId?: string

    constructor() {
        this.physicsMaterial = new CANNON.Material("groundMaterial")
        this.world = new CANNON.World()
        this.messageBus = new MessageBus()
        this.assets = new Assets()

        this.SetupWorldConfig()
        this.buildScene()
        this.BuildEvents()

        this.mainGame = new MainGame(this.physicsMaterial, this.world, this, this.messageBus)
        engine.addSystem(this.mainGame)

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
        const higherTower = new Entity()
        higherTower.addComponent(new Transform({
            position: new Vector3(8, -.5, 24),
        }))
        higherTower.addComponent(new GLTFShape('models/higherTower.glb'))
        const htAnimator = new Animator()
        const tower = new AnimationState('tower_anim', { layer: 0 })
        const under = new AnimationState('under_anim', { layer: 1 })
        const base = new AnimationState('base_anim', { layer: 2 })
        htAnimator.addClip(tower)
        htAnimator.addClip(under)
        htAnimator.addClip(base)
        higherTower.addComponent(htAnimator)
        engine.addEntity(higherTower)
        tower.reset()
        under.reset()
        base.reset()
        tower.play()
        under.play()
        base.play()
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
