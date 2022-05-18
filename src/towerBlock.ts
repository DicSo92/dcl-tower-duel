import { MoveTransformComponent } from "@dcl/ecs-scene-utils";
import { ITowerBlock, ITowerDuel } from "@/interfaces/class.interface";
import * as utils from "@dcl/ecs-scene-utils";
import FallingBlocks from "@/fallingBlocks";

export default class TowerBlock implements ISystem, ITowerBlock {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    TowerDuel: ITowerDuel
    entity: Entity
    isBase: Boolean
    scale: Vector3
    position: Vector3

    constructor(cannonMaterial: CANNON.Material, world: CANNON.World, towerDuel: ITowerDuel, isBase: boolean) {
        this.physicsMaterial = cannonMaterial
        this.world = world
        this.TowerDuel = towerDuel

        this.entity = new Entity();
        this.isBase = isBase
        this.scale = towerDuel.lastScale
        this.position = towerDuel.lastPosition
        this.Init();
    }

    Init = () => {
        this.isBase ? this.BuildBase() : this.SpawnBlock()
        this.setRandomMaterial()
        engine.addEntity(this.entity)
        this.TowerDuel.blockCount += 1
        this.TowerDuel.blocks.push(this)
    };

    private BuildBase = () => {
        this.entity.addComponent(
            new Transform({
                position: this.position,
                scale: this.scale
            })
        )
        this.entity.addComponent(new BoxShape())
    };

    private SpawnBlock() {
        this.entity.addComponent(new Transform({ scale: this.scale }))
        this.entity.addComponent(new BoxShape())
        this.setSpawnAnimation()
    }
    private setSpawnAnimation() {
        const posY = this.TowerDuel.offsetY + 0.4 * this.TowerDuel.blockCount
        let StartPos = new Vector3(0, posY, 16)
        let EndPos = new Vector3(16, posY, 0)
        this.entity.addComponent(new MoveTransformComponent(StartPos, EndPos, 3))
    }

    private setRandomMaterial() {
        const randomBetween = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
        const randomMaterialColor = new Material()
        randomMaterialColor.albedoColor = Color3.FromInts(randomBetween(0, 255), randomBetween(0, 255), randomBetween(0, 255))
        this.entity.addComponent(randomMaterialColor)
    }
    public stopBlock(prevBlock: ITowerBlock) {
        this.entity.removeComponent(utils.MoveTransformComponent) // stopTransform animation

        const currentBlockPosition = this.entity.getComponent(Transform).position
        const prevBlockPosition = prevBlock.entity.getComponent(Transform).position
        const offsetX = prevBlockPosition.x - currentBlockPosition.x
        const offsetZ = prevBlockPosition.z - currentBlockPosition.z

        const newScale: Vector3 = this.scale.clone()
        newScale.x = newScale.x - Math.abs(offsetX)
        newScale.z = newScale.z - Math.abs(offsetZ)
        this.TowerDuel.lastScale = newScale

        const newPosition: Vector3 = currentBlockPosition.clone()
        newPosition.x = newPosition.x + offsetX / 2
        newPosition.z = newPosition.z + offsetZ / 2
        this.TowerDuel.lastPosition = newPosition

        this.entity.getComponent(BoxShape).visible = false
        this.entity.removeComponent(Transform)
        this.entity.removeComponent(BoxShape)

        this.entity.addComponent(new BoxShape())
        this.entity.addComponent(new Transform({
            position: newPosition,
            scale: newScale
        }))

        const fallingBlocks = new FallingBlocks(this.physicsMaterial, this.world, this.TowerDuel, this.entity.getComponent(Transform), offsetX, offsetZ)
        engine.addSystem(fallingBlocks);
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
