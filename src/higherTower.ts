import Game from "./game";
import { map } from "@dcl/ecs-scene-utils";

export default class HigherTower implements ISystem {
    parent: Game
    global: Entity = new Entity()
    datas: any = { height: 0 }
    text: Entity
    towerParts: Entity[] = [];
    cylinder: Entity

    constructor(parent: Game) {
        this.parent = parent
        this.global.addComponent(new Transform({
            position: new Vector3(16, 1.2, 26),
            scale: new Vector3(1, 1, 1)
        }))
        engine.addEntity(this.global)

        this.parent.gameAssets.blockMaterials.forEach(material => {
            const towerPart = new Entity()
            towerPart.addComponent(new BoxShape())
            towerPart.addComponent(new Transform())
            towerPart.addComponent(material)
            towerPart.setParent(this.global)
            this.towerParts.push(towerPart)
        })

        this.cylinder = new Entity()
        this.cylinder.addComponent(new CylinderShape())
        this.cylinder.getComponent(CylinderShape).visible = false
        this.cylinder.addComponent(new Transform())
        // this.cylinder.addComponent(this.parent.sceneAssets.transparentMaterial)
        this.cylinder.setParent(this.global)

        this.text = new Entity()
        const textShape = new TextShape(`Highest Tower \n ${this.datas.height}`)
        textShape.fontSize = 1
        this.text.addComponent(textShape)
        this.text.addComponent(new Transform({
            position: new Vector3(0, 0.2, -1.2)
        }))
        this.text.setParent(this.cylinder)

        this.BuildTower()
    }

    BuildTower() {
        // const materialList = this.parent.gameAssets.blockMaterials
        for (let i = 1; i <= this.towerParts.length; i++) {
            const partHeight = map(this.datas.height, 1, 400, 0.01, 1)
            this.towerParts[i-1].getComponent(Transform).position.y = partHeight * i - (partHeight / 2)
            const baseScale = 0.4 * map(this.datas.height, 1, 400, 1, 2)
            const scale = baseScale * map(i, 1, 10, 1, 0)
            this.towerParts[i-1].getComponent(Transform).scale = new Vector3(scale, partHeight, scale)
        }
    }

    updateTower(newHeight: number) {
        this.datas.height = newHeight
        log("updateTower", this.datas.height)
        this.text.getComponent(TextShape).value = `Highest Tower \n ${this.datas.height}`
        this.BuildTower()
    }

    update(dt: number) {
        // this.cylinder.getComponent(Transform).lookAt(Camera.instance.position)
        // this.cylinder.getComponent(Transform).lookAt(Camera.instance.position)
        this.cylinder.getComponent(Transform).rotation.setEuler(0,Camera.instance.rotation.eulerAngles.y,0)
        this.cylinder.getComponent(Transform).rotation.setEuler(0,Camera.instance.rotation.eulerAngles.y,0)
    }
}
