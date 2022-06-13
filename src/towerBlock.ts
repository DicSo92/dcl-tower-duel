import { MoveTransformComponent, ScaleTransformComponent, InterpolationType, map } from "@dcl/ecs-scene-utils";
import TowerDuel from "@/towerDuel";
import FallingBlocks from "@/fallingBlocks";
import { FallingBlock } from "@/fallingBlock";
import InterEffect from "@/interEffect";

export default class TowerBlock implements ISystem {
    TowerDuel: TowerDuel
    messageBus: MessageBus
    isBase: Boolean
    animation?: MoveTransformComponent
    entity: Entity
    blockPhysic?: CANNON.Body
    fallingBlocks?: FallingBlocks
    interEffect?: InterEffect
    marginError: number = 0.15 // 1

    constructor(towerDuel: TowerDuel, animation?: MoveTransformComponent, isBase?: boolean) {
        this.TowerDuel = towerDuel
        this.messageBus = this.TowerDuel.messageBus

        this.isBase = !!isBase
        this.animation = animation

        this.entity = new Entity();
        this.entity.setParent(this.TowerDuel.gameArea)
        this.Init();
    }

    private Init = () => {
        this.isBase ? this.BuildBase() : this.SpawnBlock()
        engine.addEntity(this.entity)
        this.TowerDuel.blocks.push(this)
        this.TowerDuel.currentBlocks.push(this)
        this.setMaterial()
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

    public stopBlock(prevBlock: TowerBlock) {
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

            this.TowerDuel.blocks.pop()
            this.TowerDuel.currentBlocks.pop()

            this.TowerDuel.lift?.numericalCounter.setScore(this.TowerDuel.blocks.length)

            // this.messageBus.emit("looseHeart_"+this.TowerDuel.towerDuelId, {})
            this.TowerDuel.lift?.hearts.decremLife()
            this.TowerDuel.lift?.hearts.entity.getComponent(AudioSource).playOnce()
        }
        else if (Math.abs(offsetX) <= this.marginError && Math.abs(offsetZ) <= this.marginError) { // perfect placement (with error margin)
            this.entity.addComponent(new BoxShape())
            const transform = new Transform({
                position: new Vector3(prevBlockTransform.position.x, currentBlockTransform.position.y, prevBlockTransform.position.z),
                scale: prevBlockTransform.scale
            })
            this.entity.addComponent(transform)

            this.addPhysicBlock(transform.position, transform.scale)

            this.interEffect = new InterEffect(this.TowerDuel, this.entity, transform, true)
            engine.addSystem(this.interEffect)

            this.TowerDuel.spawner?.entity.getComponent(AudioSource).playOnce()
            this.TowerDuel.spawner?.spawnBlock()
            this.messageBus.emit("addStamina_" + this.TowerDuel.towerDuelId, {})
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
            this.addPhysicBlock(newPosition, newScale)

            this.fallingBlocks = new FallingBlocks(this.TowerDuel, currentBlockTransform, offsetX, offsetZ)
            engine.addSystem(this.fallingBlocks);

            this.interEffect = new InterEffect(this.TowerDuel, this.entity, new Transform({
                position: newPosition,
                scale: newScale
            }), false)
            engine.addSystem(this.interEffect)

            this.TowerDuel.spawner?.spawnBlock()

            this.TowerDuel.spawner?.plane.getComponent(AudioSource).playOnce()
        }
    }

    private addPhysicBlock(position: Vector3, scale: Vector3) {
        this.blockPhysic = new CANNON.Body({
            mass: 0, // kg
            position: new CANNON.Vec3(position.x, position.y, position.z), // m
            shape: new CANNON.Box(new CANNON.Vec3(scale.x / 2, scale.y / 2, scale.z / 2))
        })
        this.blockPhysic.material = this.TowerDuel.physicsMaterial
        this.TowerDuel.world.addBody(this.blockPhysic)
    }

    private setMaterial() {
        const countToChangeColor = 3
        const step = (Math.ceil(this.TowerDuel.blocks.length / countToChangeColor) - 1) % 10 // (% 10) get last digit of number (12 % 10 = 2)
        this.entity.addComponent(this.TowerDuel.gameAssets.blockMaterials[step])
    }

    public Delete() {
        this.interEffect?.Delete()
        if (this.blockPhysic) this.TowerDuel.world.remove(this.blockPhysic)
        engine.removeEntity(this.entity)
        engine.removeSystem(this)
    }

    update(dt: number) {

    }
}
