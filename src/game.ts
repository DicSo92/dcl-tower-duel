import BlueButton from "@/blueButton";
import TowerDuel from "@/towerDuel";
import { loadColliders } from "@/colliderSetup";

onSceneReadyObservable.add(() => {
    log("SCENE LOADED");
    const game = new Game()
    engine.addSystem(game);
});
import { Lift } from "./lift";


export default class Game implements ISystem {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus
    TowerDuel?: TowerDuel
    playerInputsListener: Input

    constructor() {
        this.physicsMaterial = new CANNON.Material("groundMaterial")
        this.world = new CANNON.World()
        this.messageBus = new MessageBus()

        this.playerInputsListener = Input.instance

        this.SetupWorldConfig()
        this.buildScene()
        this.BuildEvents()
    }

    private SetupWorldConfig() {
        this.world.quatNormalizeSkip = 0
        this.world.quatNormalizeFast = false
        this.world.gravity.set(0, -9.82, 0) // m/s²
        loadColliders(this.world)
        const ballContactMaterial = new CANNON.ContactMaterial(this.physicsMaterial, this.physicsMaterial, { friction: 1, restitution: 0.5 })
        this.world.addContactMaterial(ballContactMaterial)
    }

    private buildScene() {
        const blueButton = new BlueButton(new Transform({
            position: new Vector3(3, 1.1, 3),
            rotation: new Quaternion(0, 0, 0, 1),
            scale: new Vector3(2, 2, 2)
        }), this.messageBus);

        engine.addSystem(blueButton);

        const lift = new Lift(this.playerInputsListener, this.messageBus)
    }
    private BuildEvents() {
        this.messageBus.on("blueButtonClick", (test) => {
            log('new Game')
            this.TowerDuel = new TowerDuel(this.physicsMaterial, this.world, this.messageBus)
        })
    }

    update(dt: number): void {

    }
}
