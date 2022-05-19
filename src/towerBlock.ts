import { MoveTransformComponent } from "@dcl/ecs-scene-utils";
import { ITowerBlock, ITowerDuel } from "@/interfaces/class.interface";
import * as utils from "@dcl/ecs-scene-utils";
import FallingBlocks from "@/fallingBlocks";
import { FallingBlock } from "@/fallingBlock";

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

        const basePhysic: CANNON.Body = new CANNON.Body({
            mass: 0, // kg
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z), // m
            shape: new CANNON.Box(new CANNON.Vec3(this.scale.x / 2, this.scale.y / 2, this.scale.z / 2))
        })
        basePhysic.material = this.physicsMaterial
        this.world.addBody(basePhysic)
    };
    private SpawnBlock() {
        this.entity.addComponent(new Transform({ scale: this.scale }))
        this.entity.addComponent(new BoxShape())
        this.setSpawnAnimation()
    }

    private setSpawnAnimation() {
        const posY = this.TowerDuel.offsetY + 0.4 * this.TowerDuel.blockCount
        let StartPos = new Vector3(32, posY, 0)
        let EndPos = new Vector3(16, posY, 16)
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

        const currentBlockTransform = this.entity.getComponent(Transform)
        const prevBlockTransform = prevBlock.entity.getComponent(Transform)
        const offsetX = prevBlockTransform.position.x - currentBlockTransform.position.x
        const offsetZ = prevBlockTransform.position.z - currentBlockTransform.position.z

        if (Math.abs(offsetX) > prevBlockTransform.scale.x || Math.abs(offsetZ) > prevBlockTransform.scale.z) { // If block not on top of the previous
            log('game end!')
            const fallBlock = new FallingBlock(currentBlockTransform, this.physicsMaterial, this.world)
            this.TowerDuel.fallingBlocks.push(fallBlock)

            this.TowerDuel.blockCount -= 1
            this.TowerDuel.blocks.pop()
        } else {
            const newScale: Vector3 = this.scale.clone()
            newScale.x = newScale.x - Math.abs(offsetX)
            newScale.z = newScale.z - Math.abs(offsetZ)
            this.TowerDuel.lastScale = newScale

            const newPosition: Vector3 = currentBlockTransform.position.clone()
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
            const blockPhysic: CANNON.Body = new CANNON.Body({
                mass: 0, // kg
                position: new CANNON.Vec3(newPosition.x, newPosition.y, newPosition.z), // m
                shape: new CANNON.Box(new CANNON.Vec3(newScale.x / 2, newScale.y / 2, newScale.z / 2))
            })
            blockPhysic.material = this.physicsMaterial
            this.world.addBody(blockPhysic)

            const fallingBlocks = new FallingBlocks(this.physicsMaterial, this.world, this.TowerDuel, currentBlockTransform, offsetX, offsetZ)
            engine.addSystem(fallingBlocks);
        }
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
