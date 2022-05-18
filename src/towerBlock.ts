import {ITowerDuel} from "@/interfaces/class.interface";

export default class TowerBlock implements ISystem {
    TowerDuel: ITowerDuel
    entity: Entity
    isBase: Boolean
    scale: Vector3
    offsetY: number

    constructor(game: ITowerDuel, isBase: boolean) {
        this.TowerDuel = game
        this.entity = new Entity();
        this.isBase = isBase
        this.scale = new Vector3(4, 0.4, 4)
        this.offsetY = 0.2
        this.Init();
    }

    Init = () => {
        if (this.isBase) {
            this.BuildBase()
        } else {
            this.SpawnBlock()
        }
        engine.addEntity(this.entity)
        this.setRandomMaterial()
        this.TowerDuel.blockCount += 1
    };

    private BuildBase = () => {
        this.entity.addComponent(
            new Transform({
                position: new Vector3(8, this.offsetY, 8),
                scale: this.scale
            })
        )
        this.entity.addComponent(new BoxShape())
    };

    private SpawnBlock() {
        this.entity.addComponent(
            new Transform({
                position: new Vector3(8, this.offsetY + 0.4 * this.TowerDuel.blockCount, 8),
                scale: this.scale
            })
        )
        this.entity.addComponent(new BoxShape())
    }

    private setRandomMaterial() {
        const randomBetween = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
        const randomMaterialColor = new Material()
        randomMaterialColor.albedoColor = Color3.FromInts(randomBetween(0, 255), randomBetween(0, 255), randomBetween(0, 255))
        this.entity.addComponent(randomMaterialColor)
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
