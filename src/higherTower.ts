import Game from "./game";
import * as utils from "@dcl/ecs-scene-utils"

export default class HigherTower implements ISystem {
    parent: Game
    global: Entity = new Entity()
    model: Entity
    datas: any = { height: 0 }
    tower: Entity;

    constructor(parent: Game) {
        this.parent = parent
        this.global.addComponent(new Transform({
            position: new Vector3(16, 0, 24),
            scale: new Vector3(1, 1, 1)
        }))
        engine.addEntity(this.global)

        this.model = new Entity()
        this.model.addComponent(this.parent.sceneAssets.soundLooseGame)
        this.model.addComponent(this.parent.sceneAssets.higherTowerModel)
        const htAnimator = new Animator()
        this.parent.sceneAssets.higherTowerAnimStates.forEach(item => {
            htAnimator.addClip(item)
            item.reset()
            item.play()
        })
        this.model.addComponent(htAnimator)
        this.model.setParent(this.global)

        this.tower = new Entity()
        this.tower.addComponent(new Transform())
        this.tower.addComponent(new BoxShape())
        this.tower.setParent(this.global)
        const towerHeight = .05 * this.datas.height
        this.tower.getComponent(Transform).position.y = (towerHeight / 2) + 1
        this.tower.getComponent(Transform).scale = new Vector3(.5, (.05 * this.datas.height), .5)
    }

    updateTower(newHeight: number) {
        this.datas.height = newHeight
        log("updateTower", this.datas.height)
        const towerHeight = .05 * this.datas.height
        this.tower.getComponent(Transform).position.y = (towerHeight / 2) + 1
        this.tower.getComponent(Transform).scale = new Vector3(.5, (.05 * this.datas.height), .5)
    }
    update(dt: number) {
        // log("Update", dt)
    }
}
