import { FallingBlock } from "@/fallingBlock";
import {ITowerDuel} from "@/interfaces/class.interface";

export default class FallingBlocks implements ISystem {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    TowerDuel: ITowerDuel
    towerBlockTransform: Transform
    offsetX: number
    offsetZ: number
    posX: number
    posZ: number

    constructor(cannonMaterial: CANNON.Material, cannonWorld: CANNON.World, towerDuel: ITowerDuel, towerBlockTransform: Transform, offsetX: number, offsetZ: number) {
        this.physicsMaterial = cannonMaterial
        this.world = cannonWorld
        this.TowerDuel = towerDuel

        this.towerBlockTransform = towerBlockTransform
        this.offsetX = Math.abs(offsetX)
        this.offsetZ = Math.abs(offsetZ)
        this.posX = towerBlockTransform.position.x + (offsetX >= 0 ? -1 : 1) * towerBlockTransform.scale.x / 2 + (offsetX >= 0 ? -1 : 1) * Math.abs(offsetX) / 2
        this.posZ = towerBlockTransform.position.z + (offsetZ >= 0 ? -1 : 1) * towerBlockTransform.scale.z / 2 + (offsetZ >= 0 ? -1 : 1) * Math.abs(offsetZ) / 2
        this.Init()
    }
    Init = () => {
        this.BuildBlockX()
        this.BuildBlockZ()
        this.BuildBlockAngle()
    }

    private BuildBlockX() {
        const transform: Transform = new Transform({
            position: new Vector3(this.posX, this.towerBlockTransform.position.y, this.towerBlockTransform.position.z),
            scale: new Vector3(this.offsetX, 0.4, this.towerBlockTransform.scale.z)
        })
        const fallBlock = new FallingBlock(transform, this.physicsMaterial, this.world)
        this.TowerDuel.fallingBlocks.push(fallBlock)
    }
    private BuildBlockZ() {
        const transform: Transform = new Transform({
            position: new Vector3(this.towerBlockTransform.position.x, this.towerBlockTransform.position.y, this.posZ),
            scale: new Vector3(this.towerBlockTransform.scale.z, 0.4, this.offsetZ)
        })
        const fallBlock = new FallingBlock(transform, this.physicsMaterial, this.world)
        this.TowerDuel.fallingBlocks.push(fallBlock)
    }
    private BuildBlockAngle() {
        const transform: Transform = new Transform({
            position: new Vector3(this.posX, this.towerBlockTransform.position.y, this.posZ),
            scale: new Vector3(this.offsetX, 0.4, this.offsetZ)
        })
        const fallBlock = new FallingBlock(transform, this.physicsMaterial, this.world)
        this.TowerDuel.fallingBlocks.push(fallBlock)
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
