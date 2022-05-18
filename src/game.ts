import * as utils from "@dcl/ecs-scene-utils";

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
    const towerBlock = new TowerBlock();
    engine.addSystem(towerBlock);
});
