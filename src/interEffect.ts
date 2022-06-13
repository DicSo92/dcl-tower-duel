import TowerDuel from "@/towerDuel";

export default class InterEffect implements ISystem {
    TowerDuel: TowerDuel
    messageBus: MessageBus

    blockParent: Entity
    blockTransform: Transform
    isPerfect: boolean = false
    borderEntity: Entity
    borderScaleY: number = 0.16

    constructor(towerDuel: TowerDuel, blockParent: Entity, transform: Transform, isPerfect: boolean) {
        this.TowerDuel = towerDuel
        this.messageBus = this.TowerDuel.messageBus
        this.blockParent = blockParent
        this.blockTransform = transform
        this.isPerfect = isPerfect

        this.borderEntity = new Entity()
        this.borderEntity.setParent(this.blockParent)

        this.Init();
    }

    Init = () => {
        this.BuildBorderEntity()
    };

    private BuildBorderEntity() {
        let newTransform = new Transform({
            position: new Vector3(0, -0.5 + this.borderScaleY / 2, 0,),
            scale: new Vector3(1.01, this.borderScaleY, 1.01,)
        })

        this.borderEntity.addComponent(new BoxShape())
        this.borderEntity.addComponent(this.isPerfect ? this.TowerDuel.gameAssets.glowMaterial : this.TowerDuel.gameAssets.noGlowMaterial)
        this.borderEntity.addComponent(newTransform)
    }

    public Delete() {
        this.borderEntity.setParent(null)
        engine.removeEntity(this.borderEntity)
        engine.removeSystem(this)
    }

    update(dt: number) {

    }
}
