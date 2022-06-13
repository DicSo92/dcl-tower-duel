import Lift from '@/lift'
import TowerDuel from "@/towerDuel";

export default class NumericalCounter implements ISystem {
    towerDuel: TowerDuel
    global: Entity
    text: TextShape

    constructor(towerDuel: TowerDuel, lift: Lift) {
        this.towerDuel = towerDuel
        this.global = new Entity()
        this.global.addComponent(new Transform({
            position: new Vector3(0.3, 0.05, 0)
        }))
        this.global.getComponent(Transform).rotation.eulerAngles = new Vector3(90, 90, 0)

        this.text = new TextShape(this.towerDuel.blocks.length.toString())
        this.text.fontSize = 3
        this.global.addComponent(this.text)
        this.global.setParent(lift.screen)
    }

    public setScore(value: number) {
        this.text.value = value.toString()
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
