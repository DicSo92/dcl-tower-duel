import { ILift, ITowerDuel } from "@/interfaces/class.interface";

export default class NumericalCounter implements ISystem {
    towerDuel: ITowerDuel
    global: Entity
    counter: Entity
    text: TextShape

    constructor(towerDuel: ITowerDuel, lift: ILift) {
        this.towerDuel = towerDuel
        this.global = new Entity()
        this.global.addComponent(new Transform({
            position: new Vector3(-1.5, 1, .5)
        }))
        this.global.getComponent(Transform).rotation.eulerAngles = new Vector3(0, -90, 0)
        
        this.counter = new Entity()
        this.counter.addComponent(new Transform())
        this.counter.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 180, 0)
        this.counter.addComponent(this.towerDuel.gameAssets.numericalCounter)
        const numCounterAnimator = new Animator()
        this.towerDuel.gameAssets.numericalCounterAnimStates.forEach(item => {
            numCounterAnimator.addClip(item)
            item.reset()
            item.play()
        })
        this.counter.addComponent(numCounterAnimator)
        this.counter.setParent(this.global)
        this.text = new TextShape(this.towerDuel.blockCount.toString())
        this.text.fontSize = 5
        this.global.addComponent(this.text)
        this.global.setParent(lift.global)
    }

    public setScore(value: number) {
        this.text.value = value.toString()
    }

    update(dt: number) {
        // log("Update", dt)
    }
}