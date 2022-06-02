import { FallingBlock } from "@/fallingBlock";
import { ITowerDuel } from "@/interfaces/class.interface";

export default class FallingBlocks implements ISystem {
    TowerDuel: ITowerDuel
    towerBlockTransform: Transform
    offsetX: number
    offsetZ: number
    posX: number
    posZ: number

    constructor(towerDuel: ITowerDuel, towerBlockTransform: Transform, offsetX: number, offsetZ: number) {
        this.TowerDuel = towerDuel

        this.towerBlockTransform = towerBlockTransform
        this.offsetX = offsetX
        this.offsetZ = offsetZ
        this.posX = towerBlockTransform.position.x + (offsetX >= 0 ? -1 : 1) * towerBlockTransform.scale.x / 2 - (offsetX >= 0 ? -1 : 1) * Math.abs(offsetX) / 2
        this.posZ = towerBlockTransform.position.z + (offsetZ >= 0 ? -1 : 1) * towerBlockTransform.scale.z / 2 - (offsetZ >= 0 ? -1 : 1) * Math.abs(offsetZ) / 2
        this.Init()
    }
    Init = () => {
        this.BuildBlockX()
        this.BuildBlockZ()
        this.BuildBlockAngle()
    }

    private BuildBlockX() {
        const transform: Transform = new Transform({
            position: new Vector3(this.posX, this.towerBlockTransform.position.y, this.towerBlockTransform.position.z + this.offsetZ / 2),
            scale: new Vector3(Math.abs(this.offsetX), 0.4, this.towerBlockTransform.scale.z - Math.abs(this.offsetZ))
        })
        const fallBlock = new FallingBlock(this.TowerDuel, transform)
        this.TowerDuel.fallingBlocks.push(fallBlock)
    }
    private BuildBlockZ() {
        const transform: Transform = new Transform({
            position: new Vector3(this.towerBlockTransform.position.x + this.offsetX / 2, this.towerBlockTransform.position.y, this.posZ),
            scale: new Vector3(this.towerBlockTransform.scale.x - Math.abs(this.offsetX), 0.4, Math.abs(this.offsetZ))
        })
        const fallBlock = new FallingBlock(this.TowerDuel, transform)
        this.TowerDuel.fallingBlocks.push(fallBlock)
    }
    private BuildBlockAngle() {
        const transform: Transform = new Transform({
            position: new Vector3(this.posX, this.towerBlockTransform.position.y, this.posZ),
            scale: new Vector3(Math.abs(this.offsetX), 0.4, Math.abs(this.offsetZ))
        })
        const fallBlock = new FallingBlock(this.TowerDuel, transform)
        this.TowerDuel.fallingBlocks.push(fallBlock)
    }

    public Delete() {
        engine.removeSystem(this)
    }
    update(dt: number) {
        // log("Update", dt)
    }
}
