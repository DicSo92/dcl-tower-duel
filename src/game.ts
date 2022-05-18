import BlueButton from "@/blueButton";
import TowerDuel from "@/towerDuel";
import { loadColliders } from "@/colliderSetup";

// Setup our world
const world = new CANNON.World()
world.quatNormalizeSkip = 0
world.quatNormalizeFast = false
world.gravity.set(0, -9.82, 0) // m/s²
loadColliders(world)
// Setup ground material
const physicsMaterial = new CANNON.Material("groundMaterial")
const ballContactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, { friction: 1, restitution: 0.5 })
world.addContactMaterial(ballContactMaterial)

onSceneReadyObservable.add(() => {
    log("SCENE LOADED");
    const messageBus = new MessageBus()

    const blueButton = new BlueButton(new Transform({
        position: new Vector3(3, 1.1, 3),
        rotation: new Quaternion(0, 0, 0, 1),
        scale: new Vector3(2, 2, 2)
    }), messageBus);

    messageBus.on("blueButtonClick", (test) => {
        log('new Game')
        const game = new TowerDuel(physicsMaterial, world, messageBus)
    })
    engine.addSystem(blueButton);
});
