import BlueButton from "@/blueButton";
import { loadColliders } from "@/colliderSetup";
import { IMainGame } from "@/interfaces/class.interface";
import MainGame from "@/mainGame";

onSceneReadyObservable.add(() => {
    log("SCENE LOADED");
    const game = new Game()
    engine.addSystem(game);
});


export default class Game implements ISystem {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus

    mainGame?: IMainGame

    constructor() {
        this.physicsMaterial = new CANNON.Material("groundMaterial")
        this.world = new CANNON.World()
        this.messageBus = new MessageBus()

        this.SetupWorldConfig()
        this.buildScene()
        this.BuildEvents()

        this.mainGame = new MainGame(this.physicsMaterial, this.world, this.messageBus)
        engine.addSystem(this.mainGame)
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
        // const blueButton = new BlueButton(new Transform({
        //     position: new Vector3(25, 1.1, 18),
        //     rotation: new Quaternion(0, 0, 0, 1),
        //     scale: new Vector3(2, 2, 2)
        // }), this.messageBus);

        // engine.addSystem(blueButton);
    }
    private BuildEvents() {

    }

    update(dt: number): void {

    }
}
