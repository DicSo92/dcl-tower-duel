import BlueButton from "@/blueButton";
import TowerDuel from "@/towerDuel";
import { Lift } from "./lift";

onSceneReadyObservable.add(() => {
    log("SCENE LOADED");
    const messageBus = new MessageBus()
    const playerInputsListener = Input.instance

    const blueButton = new BlueButton(new Transform({
        position: new Vector3(3, 1.1, 3),
        rotation: new Quaternion(0, 0, 0, 1),
        scale: new Vector3(2, 2, 2)
    }), messageBus);

    messageBus.on("blueButtonClick", (test) => {
        log('new Game')
        const game = new TowerDuel(messageBus)
    })
    engine.addSystem(blueButton);

    // Lift
    const lift = new Lift(playerInputsListener, messageBus)

});
