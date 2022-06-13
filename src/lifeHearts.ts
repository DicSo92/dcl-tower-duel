import Lift from '@/lift'
import TowerDuel from "@/towerDuel";
import Heart from "./heart";

export default class LifeHearts implements ISystem {
    TowerDuel: TowerDuel
    messageBus: MessageBus
    entity: Entity;
    hearts: Heart[] = []
    maxHearts: number = 3
    heartCount: number = this.maxHearts
    // parent: Lift;

    constructor(towerDuel: TowerDuel, lift: Lift) {
        this.TowerDuel = towerDuel
        this.messageBus = towerDuel.messageBus
        this.entity = new Entity()
        this.entity.addComponent(this.TowerDuel.mainGame.parent.sceneAssets.soundLooseLife)
        this.entity.setParent(lift.global)
        this.entity.addComponent(new Transform({
            position: new Vector3(-.75, 1.5, -1.5),
            scale: new Vector3(1, 1, 1)
        }))
        this.entity.getComponent(Transform).rotation.eulerAngles = new Vector3(45, 0, 0)
        this.Init()
    }
    Init = () => {
        this.buildHearts()
        this.buildEvents()
    }
    // -----------------------------------------------------------------------------------------------------------------
    buildHearts = () => {
        for (let i = 1; i <= this.maxHearts; i++) {
            const heart = new Heart(this.TowerDuel, new Vector3(0.5 * i, 0, 0), true)
            heart.entity.setParent(this.entity)
            this.hearts.push(heart)
        }
    }

    buildEvents = () => {
        this.messageBus.on('looseHeart', () => {
            this.decremLife()
        })
    }

    public decremLife() {
        let fHearts = this.hearts.filter(heart => heart.isActive)
        if (fHearts.length) {
            fHearts[0].toggle()
            this.TowerDuel.spawner?.spawnBlock()
        } else {
            log("No hearts remaining")
            this.TowerDuel.GameFinish()
        }
    }
    update(dt: number) {
        // log("Update", dt)
    }
}
