import { MoveTransformComponent, ScaleTransformComponent, InterpolationType, map } from "@dcl/ecs-scene-utils";
import { ITowerBlock, ITowerDuel } from "@/interfaces/class.interface";
import FallingBlocks from "@/fallingBlocks";
import { FallingBlock } from "@/fallingBlock";

export default class TowerBlock implements ISystem, ITowerBlock {
    TowerDuel: ITowerDuel
    messageBus: MessageBus
    isBase: Boolean
    animation?: MoveTransformComponent
    entity: Entity
    fallingBlocks?: FallingBlocks
    colorRatio: number = 0
    isGlowing: boolean = false
    glowEntity?: Entity
    transparentColor: Color4

    constructor(towerDuel: ITowerDuel, animation?: MoveTransformComponent, isBase?: boolean) {
        this.TowerDuel = towerDuel
        this.messageBus = this.TowerDuel.messageBus

        this.isBase = !!isBase
        this.animation = animation
        this.transparentColor = new Color4(0,0,0,0)

        this.entity = new Entity();
        this.entity.setParent(this.TowerDuel.gameArea)
        this.Init();
    }

    Init = () => {
        this.isBase ? this.BuildBase() : this.SpawnBlock()
        this.TowerDuel.blockCount += 1
        this.setMaterial()
        engine.addEntity(this.entity)
        this.TowerDuel.blocks.push(this)
    };

    private BuildBase = () => {
        this.entity.addComponent(
            new Transform({
                position: this.TowerDuel.lastPosition,
                scale: this.TowerDuel.lastScale
            })
        )
        this.entity.addComponent(new BoxShape())

        const basePhysic: CANNON.Body = new CANNON.Body({
            mass: 0, // kg
            position: new CANNON.Vec3(this.TowerDuel.lastPosition.x, this.TowerDuel.lastPosition.y, this.TowerDuel.lastPosition.z), // m
            shape: new CANNON.Box(new CANNON.Vec3(this.TowerDuel.lastScale.x / 2, this.TowerDuel.lastScale.y / 2, this.TowerDuel.lastScale.z / 2))
        })
        basePhysic.material = this.TowerDuel.physicsMaterial
        this.TowerDuel.world.addBody(basePhysic)
    };

    private SpawnBlock() {
        let block = new BoxShape()
        block.withCollisions = false
        this.entity.addComponent(block)
        this.entity.addComponent(new Transform())

        let StartSize = new Vector3(0.4, 0.1, 0.4)
        let EndSize = this.TowerDuel.lastScale
        this.entity.addComponent(new ScaleTransformComponent(StartSize, EndSize, 0.3, undefined, InterpolationType.EASEINQUAD))

        // this.entity.addComponent(new Transform({ scale: this.TowerDuel.lastScale }))
        if (this.animation) this.entity.addComponent(this.animation)
    }

    public stopBlock(prevBlock: ITowerBlock) {
        this.entity.removeComponent(MoveTransformComponent) // stopTransform animation

        const currentBlockTransform = this.entity.getComponent(Transform)
        const prevBlockTransform = prevBlock.entity.getComponent(Transform)

        const offsetX = prevBlockTransform.position.x - currentBlockTransform.position.x
        const offsetZ = prevBlockTransform.position.z - currentBlockTransform.position.z

        this.entity.removeComponent(Transform)
        this.entity.removeComponent(BoxShape)

        if (Math.abs(offsetX) > prevBlockTransform.scale.x || Math.abs(offsetZ) > prevBlockTransform.scale.z) { // If block not on top of the previous
            log('Block missed')
            const fallBlock = new FallingBlock(this.TowerDuel, currentBlockTransform)
            this.TowerDuel.fallingBlocks.push(fallBlock)

            this.TowerDuel.blockCount -= 1
            this.TowerDuel.blocks.pop()

            // this.messageBus.emit("looseHeart_"+this.TowerDuel.towerDuelId, {})
            this.TowerDuel.lift?.hearts.decremLife()
        }
        else if (Math.abs(offsetX) <= 0.1 && Math.abs(offsetZ) <= 0.1) { // perfect placement (with error margin)
            this.entity.addComponent(new BoxShape())
            this.entity.addComponent(new Transform({
                position: new Vector3(prevBlockTransform.position.x, currentBlockTransform.position.y, prevBlockTransform.position.z),
                scale: prevBlockTransform.scale
            }))

            this.TowerDuel.spawner?.spawnBlock()
        }
        else {
            const newScale: Vector3 = this.TowerDuel.lastScale.clone()
            newScale.x = newScale.x - Math.abs(offsetX)
            newScale.z = newScale.z - Math.abs(offsetZ)
            this.TowerDuel.lastScale = newScale

            const newPosition: Vector3 = currentBlockTransform.position.clone()
            newPosition.x = newPosition.x + offsetX / 2
            newPosition.z = newPosition.z + offsetZ / 2
            this.TowerDuel.lastPosition = newPosition

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
            blockPhysic.material = this.TowerDuel.physicsMaterial
            this.TowerDuel.world.addBody(blockPhysic)
            this.fallingBlocks = new FallingBlocks(this.TowerDuel, currentBlockTransform, offsetX, offsetZ)
            engine.addSystem(this.fallingBlocks);

            this.glowAnimation(new Transform({
                position: newPosition,
                scale: newScale
            }))

            this.TowerDuel.spawner?.spawnBlock()

            this.messageBus.emit("addStamina_" + this.TowerDuel.towerDuelId, {})
        }
    }

    private glowAnimation(transform: Transform) {
        let newTransform = new Transform({
            position: transform.position,
            scale: new Vector3(
                transform.scale.x + 0.01,
                transform.scale.y + 0.01,
                transform.scale.z + 0.01,
            )
        })

        this.glowEntity = new Entity()
        this.glowEntity.addComponent(new BoxShape())
        // const material = new Material()
        // material.albedoColor = this.transparentColor
        // // material.albedoColor = Color3.Gray()
        // material.metallic = 0.0
        // material.roughness = 1.0
        this.glowEntity.addComponent(this.TowerDuel.gameAssets.glowMaterial)
        this.glowEntity.addComponent(newTransform)
        this.glowEntity.setParent(this.TowerDuel.gameArea)
        this.isGlowing = true
    }

    private setMaterial() {
        const countToChangeColor = 3
        const step = (Math.ceil(this.TowerDuel.blockCount / countToChangeColor) - 1) % 10 // (% 10) get last digit of number (12 % 10 = 2)
        this.entity.addComponent(this.TowerDuel.gameAssets.blockMaterials[step])
    }

    public Delete() {
        engine.removeEntity(this.entity)
        engine.removeSystem(this)
    }

    update(dt: number) {
        if (this.glowEntity && this.isGlowing) {

            this.glowEntity.getComponent(Material).albedoColor = Color4.Lerp(Color4.Green(), this.transparentColor, this.colorRatio)
            if (this.colorRatio < 1) {
                this.colorRatio += 0.05
            } else {
                this.colorRatio = 0
                this.isGlowing = false

                // this.glowEntity.getComponent(BoxShape).visible = false
                this.glowEntity.removeComponent(Material)
                this.glowEntity.setParent(null)
                engine.removeEntity(this.glowEntity)
                engine.removeSystem(this)
            }
            // ---------------------------------------------------------------------------------------------------------
            // this.glowEntity.getComponent(Material).emissiveColor = Color3.Lerp(new Color3(1.75, 1.25, 0.0), Color3.Black(), this.colorRatio)
            // if (this.colorRatio < 1) {
            //     this.colorRatio += 0.01
            // } else {
            //     this.colorRatio = 0
            //     this.isGlowing = false
            //     // this.glowEntity.getComponent(BoxShape).visible = false
            // }
            // ---------------------------------------------------------------------------------------------------------
            // if (this.colorRatio >= 0) {
            //     this.glowEntity.getComponent(Material).emissiveColor = new Color3(
            //         map(this.colorRatio, 0, 1, 0, 1.75),
            //         map(this.colorRatio, 0, 1, 0, 1.25),
            //         map(this.colorRatio, 0, 1, 0, 0),
            //     )
            //
            //     this.colorRatio -= 0.05
            // } else {
            //     this.colorRatio = 1
            //     this.isGlowing = false
            //     // this.glowEntity.getComponent(BoxShape).visible = false
            // }
        }

        // log("Update", dt)
    }
}
