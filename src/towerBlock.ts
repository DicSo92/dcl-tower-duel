import { MoveTransformComponent, ScaleTransformComponent, InterpolationType, map } from "@dcl/ecs-scene-utils";
import { ITowerBlock, ITowerDuel } from "@/interfaces/class.interface";
import FallingBlocks from "@/fallingBlocks";
import { FallingBlock } from "@/fallingBlock";
import InterEffect from "@/interEffect";

export default class TowerBlock implements ISystem, ITowerBlock {
    TowerDuel: ITowerDuel
    messageBus: MessageBus
    isBase: Boolean
    animation?: MoveTransformComponent
    entity: Entity
    fallingBlocks?: FallingBlocks
    interEffect?: InterEffect

    constructor(towerDuel: ITowerDuel, animation?: MoveTransformComponent, isBase?: boolean) {
        this.TowerDuel = towerDuel
        this.messageBus = this.TowerDuel.messageBus

        this.isBase = !!isBase
        this.animation = animation

        this.entity = new Entity();
        this.entity.setParent(this.TowerDuel.gameArea)
        this.Init();
    }

    Init = () => {
        this.isBase ? this.BuildBase() : this.SpawnBlock()
        engine.addEntity(this.entity)
        this.TowerDuel.blockCount += 1
        this.TowerDuel.lift.numericalCounter.setScore(this.TowerDuel.blockCount)
        this.setMaterial()
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
            this.TowerDuel.lift.numericalCounter.setScore(this.TowerDuel.blockCount)
            this.TowerDuel.blocks.pop()

            // this.messageBus.emit("looseHeart_"+this.TowerDuel.towerDuelId, {})
            this.TowerDuel.lift?.hearts.decremLife()
        }
        else if (Math.abs(offsetX) <= 0.2 && Math.abs(offsetZ) <= 0.2) { // perfect placement (with error margin)
            this.entity.addComponent(new BoxShape())
            const transform = new Transform({
                position: new Vector3(prevBlockTransform.position.x, currentBlockTransform.position.y, prevBlockTransform.position.z),
                scale: prevBlockTransform.scale
            })
            this.entity.addComponent(transform)

            this.interEffect = new InterEffect(this.TowerDuel, transform, true)
            engine.addSystem(this.interEffect)

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

            this.interEffect = new InterEffect(this.TowerDuel, new Transform({
                position: newPosition,
                scale: newScale
            }), false)
            engine.addSystem(this.interEffect)

            this.TowerDuel.spawner?.spawnBlock()

            this.messageBus.emit("addStamina_" + this.TowerDuel.towerDuelId, {})
        }
    }

    private setMaterial() {
        const countToChangeColor = 3
        const step = (Math.ceil(this.TowerDuel.blockCount / countToChangeColor) - 1) % 10 // (% 10) get last digit of number (12 % 10 = 2)
        this.entity.addComponent(this.TowerDuel.gameAssets.blockMaterials[step])
    }

    public Delete() {
        engine.removeEntity(this.entity)
        if (this.interEffect) this.interEffect.Delete()
        engine.removeSystem(this)
    }

    update(dt: number) {

    }
}
