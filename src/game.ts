import * as utils from "@dcl/ecs-scene-utils";
import BlueButton from "@/blueButton";


class TowerBlock implements ISystem {
    entity: Entity;

    constructor() {
        this.entity = new Entity();
        this.Init();
    }

    Init = () => {
        this.BuildBox()
    };

    BuildBox = () => {
        log("testage")
        this.entity.addComponent(
            new Transform({
                position: new Vector3(8, 0.2, 8),
                scale: new Vector3(4, 0.4, 4)
            })
        )
        this.entity.addComponent(new BoxShape())
        engine.addEntity(this.entity)
    };

    update(dt: number) {
        // log("Update", dt)
    }
}

onSceneReadyObservable.add(() => {
    log("SCENE LOADED");
    // blueButton.addComponent(new GLTFShape('models/Blue_Button.glb'))

    const blueButton = new BlueButton(new Transform({
        position: new Vector3(3, 1.1, 3),
        rotation: new Quaternion(0, 0, 0, 1),
        scale: new Vector3(2, 2, 2)
    }));
    const towerBlock = new TowerBlock();
    engine.addSystem(towerBlock);
    engine.addSystem(blueButton);
});
