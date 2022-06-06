import Game from "./game";
import * as utils from "@dcl/ecs-scene-utils"

export default class HigherTower implements ISystem {
    parent: Game
    higherTower: Entity

    constructor(parent: Game) {
        this.parent = parent

        this.higherTower = new Entity()
        this.higherTower.addComponent(new Transform({
            position: new Vector3(16, 0, 24),
            scale: new Vector3(1, 1, 1)
        }))
        this.higherTower.addComponent(this.parent.sceneAssets.higherTowerModel)
        const htAnimator = new Animator()
        this.parent.sceneAssets.higherTowerAnimStates.forEach(item => {
            htAnimator.addClip(item)
            item.reset()
            item.play()
        })
        this.higherTower.addComponent(htAnimator)
        engine.addEntity(this.higherTower)
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
