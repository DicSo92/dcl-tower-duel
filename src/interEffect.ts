import { ITowerDuel } from "@/interfaces/class.interface";

export default class InterEffect implements ISystem {
    TowerDuel: ITowerDuel
    messageBus: MessageBus

    blockTransform: Transform
    isPerfect: boolean = false
    borderEntity: Entity

    constructor(towerDuel: ITowerDuel, transform: Transform, isPerfect: boolean) {
        this.TowerDuel = towerDuel
        this.messageBus = this.TowerDuel.messageBus
        this.blockTransform = transform
        this.isPerfect = isPerfect

        this.borderEntity = new Entity()
        this.Init();
    }

    Init = () => {
        this.BuildBorderEntity()
    };
    private BuildBorderEntity() {
        let newTransform = new Transform({
            position: new Vector3(
                this.blockTransform.position.x,
                this.blockTransform.position.y - 0.18,
                this.blockTransform.position.z,
            ),
            scale: new Vector3(
                this.blockTransform.scale.x + 0.01,
                0.04,
                this.blockTransform.scale.z + 0.01,
            )
        })

        this.borderEntity.addComponent(new BoxShape())
        this.borderEntity.addComponent(this.isPerfect ? this.TowerDuel.gameAssets.glowMaterial : this.TowerDuel.gameAssets.noGlowMaterial)
        this.borderEntity.addComponent(newTransform)
        this.borderEntity.setParent(this.TowerDuel.gameArea)
    }

    public Delete() {
        this.borderEntity.setParent(null)
        engine.removeEntity(this.borderEntity)
        engine.removeSystem(this)
    }

    update(dt: number) {

    }
}
