import * as utils from "@dcl/ecs-scene-utils";
import BlueButton from "@/blueButton";
import TowerBlock from "@/towerBlock";

onSceneReadyObservable.add(() => {
    log("SCENE LOADED");
    const messageBus = new MessageBus()

    const towerBlock = new TowerBlock();

    const blueButton = new BlueButton(new Transform({
        position: new Vector3(3, 1.1, 3),
        rotation: new Quaternion(0, 0, 0, 1),
        scale: new Vector3(2, 2, 2)
    }));

    messageBus.on("blueButtonClick", (test) => {
        log('test var :', test)
    })
    engine.addSystem(towerBlock);
    engine.addSystem(blueButton);
});
