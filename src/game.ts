import BlueButton from "@/blueButton";
import TowerDuel from "@/towerDuel";
import { loadColliders } from "@/colliderSetup";
import PlayerSelector from "./playerSelector";
import * as utils from '@dcl/ecs-scene-utils'
import { StartTowerDuelAction } from '@/actions/towerDuel'
import { GoToPlayAction, WaitTowerDuelAction } from "./actions/beforeTowerDuel";
import { BackToLobbyAction } from "./actions/afterTowerDuel";

onSceneReadyObservable.add(() => {
    log("SCENE LOADED");
    const game = new Game()
    engine.addSystem(game);
});


export default class Game implements ISystem {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus
    TowerDuel?: TowerDuel
    playerSelector1: PlayerSelector

    constructor() {
        this.physicsMaterial = new CANNON.Material("groundMaterial")
        this.world = new CANNON.World()
        this.messageBus = new MessageBus()

        // Selector
        this.playerSelector1 = new PlayerSelector(this.messageBus)
        
        this.SetupWorldConfig()
        this.buildScene()
        this.BuildEvents()
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
        const blueButton = new BlueButton(new Transform({
            position: new Vector3(25, 1.1, 18),
            rotation: new Quaternion(0, 0, 0, 1),
            scale: new Vector3(2, 2, 2)
        }), this.messageBus);

        engine.addSystem(blueButton);
    }
    private BuildEvents() {
        this.messageBus.on("BeforeTowerDuelSequence", () => {
            log('BeforeTowerDuelSequence')

            const beforeTowerDuelSequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                .then(new GoToPlayAction(this.playerSelector1))
                .then(new WaitTowerDuelAction(this.messageBus))

            const beforeTowerDuelSystem = new utils.ActionsSequenceSystem(beforeTowerDuelSequence)
            // actionSystem.setOnFinishCallback(() => { })
            engine.addSystem(beforeTowerDuelSystem)
        })
        this.messageBus.on("TowerDuelSequence", () => {
            log('TowerDuelSequence')

            const towerDuelSequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                .then(new StartTowerDuelAction(this.physicsMaterial, this.world, this.messageBus))
            const towerDuelSystem = new utils.ActionsSequenceSystem(towerDuelSequence)
            // actionSystem.setOnFinishCallback(() => { })
            engine.addSystem(towerDuelSystem)
        })
        this.messageBus.on("AfterTowerDuelSequence", () => {
            log('AfterTowerDuelSequence')

            const afterTowerDuelSequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                .then(new BackToLobbyAction(this.playerSelector1))
            const aftertowerDuelSystem = new utils.ActionsSequenceSystem(afterTowerDuelSequence)
            // actionSystem.setOnFinishCallback(() => { })
            engine.addSystem(aftertowerDuelSystem)
        })
    }

    update(dt: number): void {

    }
}
