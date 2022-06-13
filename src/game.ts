import { loadColliders } from "@/colliderSetup";
import { IUser } from "@/interfaces/class.interface";
import MainGame from "@/mainGame";
import { GameAssets, SceneAssets } from "@/assets";
import * as utils from "@dcl/ecs-scene-utils";
import LobbyScreen from "@/lobbyScreen";
import HigherTower from "./higherTower";
import { LeaderBoard } from "./LeaderBoard";

onSceneReadyObservable.add(() => {
    log("SCENE LOADED");
    const game = new Game()
    engine.addSystem(game);
});

export default class Game implements ISystem {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus
    gameAssets: GameAssets
    sceneAssets: SceneAssets
    mainGame0?: MainGame
    mainGame1?: MainGame
    user: IUser = { public_address: '', name: '' }
    rulesBtn: Entity = new Entity()
    playBtn: Entity = new Entity()
    globalScene: Entity = new Entity()
    higherTower?: HigherTower;
    streamSource?: Entity;
    leaderBoard?: LeaderBoard;

    constructor() {
        this.physicsMaterial = new CANNON.Material("groundMaterial")
        this.world = new CANNON.World()
        this.messageBus = new MessageBus()
        this.gameAssets = new GameAssets()
        this.sceneAssets = new SceneAssets()

        this.SetupWorldConfig()
        this.buildScene()
        this.BuildEvents()

        this.mainGame0 = new MainGame(this.physicsMaterial, this.world, this, this.messageBus, 'left')
        engine.addSystem(this.mainGame0)
        this.mainGame1 = new MainGame(this.physicsMaterial, this.world, this, this.messageBus, 'right')
        engine.addSystem(this.mainGame1)

        const arena = new Entity()
        arena.addComponent(new GLTFShape('models/globalScene.glb'))
        arena.addComponent(new Transform({
            position: new Vector3(16, 0, 16)
        }))
        arena.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 0)
        engine.addEntity(arena)
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
        const lobbyScreen = new LobbyScreen(this, new Vector3(16, 1, 17))
        engine.addSystem(lobbyScreen)

        this.higherTower = new HigherTower(this)
        engine.addSystem(this.higherTower)
        const dclLogo = new Entity()
        dclLogo.addComponent(new GLTFShape('models/dcl_logo.glb'))
        dclLogo.addComponent(new Transform({
            position: new Vector3(12, 3, 24),
        }))
        dclLogo.addComponent(new OnPointerDown(() => {
            openExternalURL('https://decentraland.org/')
        }, {
            button: ActionButton.POINTER,
            showFeedback: true,
            hoverText: "Decentraland",
        }))
        engine.addEntity(dclLogo)

        const mghLogo = new Entity()
        mghLogo.addComponent(new GLTFShape('models/mgh_logo.glb'))
        mghLogo.addComponent(new Transform({
            position: new Vector3(20, 3, 24),
        }))
        mghLogo.addComponent(new OnPointerDown(() => {
            openExternalURL('https://www.metagamehub.io/')
        }, {
            button: ActionButton.POINTER,
            showFeedback: true,
            hoverText: "MetaGameHub",
        }))
        engine.addEntity(mghLogo)

        this.streamSource = new Entity()
        this.streamSource.addComponent(
            new AudioStream(
                "http://frequence3.net-radio.fr/frequence3world.mp3" // http://direct.fipradio.fr/live/fip-webradio6.mp3; http://direct.fipradio.fr/live/fip-lofi.mp3;
            )
        )
        this.streamSource.getComponent(AudioStream).volume = 0.05
        engine.addEntity(this.streamSource)

        this.streamSource.getComponent(AudioStream).playing = true

        this.leaderBoard = new LeaderBoard()
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
    }

    update(dt: number): void {
    }
}
