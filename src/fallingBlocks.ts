export default class FallingBlocks implements ISystem {
    towerBlockTransform: Transform
    offsetX: number
    offsetZ: number
    posX: number
    posZ: number

    constructor(towerBlockTransform: Transform, offsetX: number, offsetZ: number) {
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
        const fallBlock = new Entity()
        fallBlock.addComponent(new BoxShape())
        fallBlock.addComponent(new Transform({
            position: new Vector3(this.posX, this.towerBlockTransform.position.y, this.towerBlockTransform.position.z),
            scale: new Vector3(this.offsetX, 0.4, this.towerBlockTransform.scale.z)
        }))
        engine.addEntity(fallBlock);
    }
    private BuildBlockZ() {
        const fallBlock = new Entity()
        fallBlock.addComponent(new BoxShape())
        fallBlock.addComponent(new Transform({
            position: new Vector3(this.towerBlockTransform.position.x, this.towerBlockTransform.position.y, this.posZ),
            scale: new Vector3(this.towerBlockTransform.scale.z, 0.4, this.offsetZ)
        }))
        engine.addEntity(fallBlock);
    }
    private BuildBlockAngle() {
        const fallBlock = new Entity()
        fallBlock.addComponent(new BoxShape())
        fallBlock.addComponent(new Transform({
            position: new Vector3(this.posX, this.towerBlockTransform.position.y, this.posZ),
            scale: new Vector3(this.offsetX, 0.4, this.offsetZ)
        }))
        const color = new Material()
        color.albedoColor = Color3.FromInts(16, 120, 200)
        fallBlock.addComponent(color)
        engine.addEntity(fallBlock);
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
