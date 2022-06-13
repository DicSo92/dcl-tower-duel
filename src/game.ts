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
    user: IUser = { public_address: "", name: "", realm: "" }
    rulesBtn: Entity = new Entity()
    playBtn: Entity = new Entity()
    globalScene: Entity = new Entity()
    higherTower?: HigherTower;
    streamSource?: Entity;
    leaderBoard?: LeaderBoard;
    lobbyScreen?: LobbyScreen;

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
        this.lobbyScreen = new LobbyScreen(this, new Vector3(16, 1, 17))
        engine.addSystem(this.lobbyScreen)

        this.higherTower = new HigherTower(this)
        engine.addSystem(this.higherTower)

        this.leaderBoard = new LeaderBoard(this)
    }

    private BuildEvents() {
    }

    update(dt: number): void {
    }
}
