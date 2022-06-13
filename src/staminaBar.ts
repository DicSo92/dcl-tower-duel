import Lift from '@/lift'
import TowerDuel from "@/towerDuel";

export default class StaminaBar implements ISystem {
    TowerDuel: TowerDuel
    messageBus: MessageBus

    entity: Entity;
    bars: Entity[] = []
    maxStamina: number = 10
    minStamina: number = 0
    staminaCount: number = 0

    cellSize: number = 0.1015 // 0.203 for 0.5 barScale
    barScale: number = 0.25

    constructor(towerDuel: TowerDuel, lift: Lift) {
        this.TowerDuel = towerDuel
        this.messageBus = towerDuel.messageBus

        this.entity = new Entity()
        this.entity.addComponent(this.TowerDuel.mainGame.parent.sceneAssets.soundSpell)
        this.entity.addComponent(new Transform({
            position: new Vector3(0.2, 0, 0.42),
            scale: new Vector3(1, 1, 1)
        }))
        this.entity.getComponent(Transform).rotation.eulerAngles = new Vector3(0, -90, 0)
        this.entity.setParent(lift.miniScreenLeft)

        this.Init()
    }
    Init = () => {
        this.buildStaminaBars()
        this.buildEvents()
    }
    // -----------------------------------------------------------------------------------------------------------------
    buildStaminaBars = () => {
        for (let i = 1; i <= this.maxStamina; i++) {
            const staminaBar = new Entity()
            // staminaBar.addComponentOrReplace(this.TowerDuel.gameAssets.staminaBar)
            staminaBar.addComponentOrReplace(new Transform({
                position: new Vector3(0.075 * i, 0, 0)
            }))
            this.entity.getComponent(Transform).rotation.eulerAngles = new Vector3(180, 90, 0)
            staminaBar.setParent(this.entity)

            this.bars.push(staminaBar)
        }
    }

    private setStamina(stamina: number) {
        log("setStamina", stamina)
        this.staminaCount = stamina

        for (let i = 1; i <= this.maxStamina; i++) {
            if (i <= this.staminaCount) {
                this.bars[i-1].addComponentOrReplace(this.TowerDuel.gameAssets.staminaBar)
            } else {
                this.bars[i-1].removeComponent(GLTFShape)
            }
        }
    }

    private buildEvents = () => {
        this.messageBus.on("addStamina_" + this.TowerDuel.towerDuelId, () => {
            log("addStamina_", this.staminaCount)
            if (this.staminaCount < this.maxStamina) this.setStamina(this.staminaCount + 1)
            log("addStamina_", this.staminaCount)
        })

        this.messageBus.on("removeStamina_" + this.TowerDuel.towerDuelId, (data: { cost: number }) => {
            log("removeStamina_", this.staminaCount, "cost", data.cost, "result", (this.staminaCount - data.cost).toString)
            if (this.staminaCount >= this.minStamina && (this.staminaCount - data.cost) >= 0) {
                log("valide removing", this.staminaCount)
                this.setStamina(this.staminaCount - data.cost)
                log("removedStamina", this.staminaCount)
            }
            log("removeStamina_", this.staminaCount)
        })

    }
    update(dt: number) {
        // log("Update", dt)
    }
}
