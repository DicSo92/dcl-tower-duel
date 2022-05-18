import * as utils from "@dcl/ecs-scene-utils";
import BlueButton from "@/blueButton";
import TowerBlock from "@/towerBlock";
import TowerDuel from "@/towerDuel";

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
        const game = new TowerDuel(messageBus)
    })
    engine.addSystem(blueButton);

});
