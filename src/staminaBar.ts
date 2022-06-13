import Lift from '@/lift'
import TowerDuel from "@/towerDuel";

export default class StaminaBar implements ISystem {
    TowerDuel: TowerDuel
    messageBus: MessageBus
    entity: Entity;
    bar: Entity
    staminaOn: Entity
    staminaOff: Entity
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
            position: new Vector3(0.25, 1.3, -1.3),
            scale: new Vector3(1, 1, 1)
        }))
        this.entity.getComponent(Transform).rotation.eulerAngles = new Vector3(-45, 180, 0)
        this.entity.setParent(lift.global)

        this.bar = new Entity()
        this.bar.setParent(this.entity)

        this.staminaOn = new Entity()
        this.staminaOff = new Entity()
        this.staminaOn.setParent(this.entity)
        this.staminaOff.setParent(this.entity)

        this.Init()
    }
    Init = () => {
        this.buildStaminaBar()
        this.buildEvents()
    }
    // -----------------------------------------------------------------------------------------------------------------
    buildStaminaBar = () => {
        const staminaBarModel = new GLTFShape('models/StaminaBar.glb')
        this.bar.addComponent(new Transform({
            scale: new Vector3(this.barScale, this.barScale, this.barScale)
        }))
        this.bar.addComponent(staminaBarModel)

        this.staminaOn.addComponent(new BoxShape())
        const onMaterial = new Material()
        onMaterial.albedoColor = Color3.FromInts(77, 145, 209)
        this.staminaOn.addComponent(onMaterial)

        this.staminaOff.addComponent(new BoxShape())
        const offMaterial = new Material()
        offMaterial.albedoColor = Color3.FromInts(10, 15, 25)
        this.staminaOff.addComponent(offMaterial)

        this.setStamina(this.staminaCount)
    }

    private setStamina(stamina: number) {
        log("setStamina", stamina)
        this.staminaCount = stamina

        const scaleXOn = this.cellSize * stamina
        this.staminaOn.addComponentOrReplace(new Transform({
            position: new Vector3(-(this.cellSize * 5) + scaleXOn / 2, 0, 0),
            scale: new Vector3(scaleXOn, 0.01, 0.07)
        }))

        const scaleXOff = this.cellSize * (this.maxStamina - stamina)
        this.staminaOff.addComponentOrReplace(new Transform({
            position: new Vector3(-(this.cellSize * 5) + scaleXOn + scaleXOff / 2, 0, 0),
            scale: new Vector3(scaleXOff, 0.005, 0.07)
        }))
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
