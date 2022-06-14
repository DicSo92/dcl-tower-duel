import {
    Delay,
    FollowCurvedPathComponent, InterpolationType,
    MoveTransformComponent, ScaleTransformComponent,
    ToggleComponent,
    ToggleState
} from "@dcl/ecs-scene-utils";
import TowerDuel from "@/towerDuel";
import TowerBlock from "@/towerBlock";

export default class Spawner implements ISystem {
    TowerDuel: TowerDuel
    messageBus: MessageBus

    plane: Entity
    entity: Entity
    spawnInterval: Entity
    spawningBlock?: TowerBlock
    spawnSpeed: number = 3
    moveDuration: number = 10

    constructor(towerDuel: TowerDuel) {
        this.TowerDuel = towerDuel
        this.messageBus = this.TowerDuel.messageBus

        this.plane = new Entity();
        this.plane.addComponent(this.TowerDuel.mainGame.parent.sceneAssets.soundStopBlock)
        this.plane.addComponent(new Transform({
            scale: new Vector3(1, 1, 1)
        }))
        this.plane.setParent(this.TowerDuel.gameArea)

        this.entity = new Entity();
        this.entity.addComponent(this.TowerDuel.mainGame.parent.sceneAssets.soundStopBlockPerfect)
        this.entity.setParent(this.plane)
        this.spawnInterval = new Entity()

        this.Init();
    }

    Init = () => {
        this.BuildSpawner()
        this.entity.getComponent(ToggleComponent).toggle()
        engine.addSystem(this)
        this.BuildEvents()

        this.upSpawner()
    };

    private BuildSpawner() {
        let spawner = new GLTFShape('models/spawner.glb')
        spawner.withCollisions = false
        this.entity.addComponent(spawner)
        this.entity.addComponent(new Transform())

        this.entity.addComponent(new Animator())
        const diamondAnimation = new AnimationState("DiamondAction", { layer: 0 })
        const ringAnimation = new AnimationState("RingAction", { layer: 1 })
        this.entity.getComponent(Animator).addClip(diamondAnimation)
        this.entity.getComponent(Animator).addClip(ringAnimation)
        diamondAnimation.play()
        ringAnimation.play()

        // Move entity infinitely
        this.entity.addComponent(new ToggleComponent(ToggleState.Off,(value: ToggleState) => {
            //Define the positions of the path for move animation
            const path = [
                new Vector3(13, 0, 1.2),
                new Vector3(14.8, 0, 3),
                new Vector3(14.8, 0, 13),
                new Vector3(13, 0, 14.8),
                new Vector3(3.2, 0, 14.8),
                new Vector3(1.2, 0, 13),
                new Vector3(1.2, 0, 3),
                new Vector3(3, 0, 1.2),
            ]
            this.entity.addComponentOrReplace(new FollowCurvedPathComponent(path, this.moveDuration, 25, true, true, () => {
                log('curve finished')
                this.entity.getComponent(ToggleComponent).toggle()
            }))
        }))
    }

    public upSpawner() {
        const posY = this.TowerDuel.offsetY + this.TowerDuel.blockScaleY * this.TowerDuel.currentBlocks.length
        this.plane.addComponentOrReplace(new MoveTransformComponent(this.plane.getComponent(Transform).position, new Vector3(0, posY, 0), 0.25))
        this.spawnSpeed -= 0.01
    }

    public spawnBlock() {
        this.TowerDuel.lift?.numericalCounter.setScore(this.TowerDuel.blocks.length)

        if (this.TowerDuel.currentBlocks.length >= this.TowerDuel.maxCount) {
            log('Max Count reached !!')
            this.maxCountReachedAnimation()
        } else {
            log('spawn block')
            const animation = this.spawnAnimation()
            this.spawningBlock = new TowerBlock(this.TowerDuel, animation);
            engine.addSystem(this.spawningBlock);

            this.TowerDuel.lift?.autoMove()
        }
        this.upSpawner()
    }

    maxCountReachedAnimation() {
        const blockTimeTravel = 0.1
        const slice = 3
        const offsetRescale = 7
        const remainingBlocks = this.TowerDuel.currentBlocks.slice(-slice)
        const blocksToRemove = this.TowerDuel.currentBlocks.slice(0, -slice)

        remainingBlocks.forEach((block, index) => {
            const startPos = block.entity.getComponent(Transform).position
            const endPos = new Vector3(startPos.x, this.TowerDuel.offsetY + index * this.TowerDuel.blockScaleY, startPos.z)
            block.entity.addComponent(new MoveTransformComponent(startPos, endPos, (this.TowerDuel.maxCount * blockTimeTravel) - (slice * blockTimeTravel)))
        })
        blocksToRemove.forEach((block, index) => {
            if (index + 1 > offsetRescale) {
                const startPos = block.entity.getComponent(Transform).position
                const endPos = new Vector3(startPos.x, this.TowerDuel.offsetY - this.TowerDuel.blockScaleY, startPos.z)

                block.entity.addComponent(new Delay(blockTimeTravel * ((index + 1) - offsetRescale) * 1000, () => {
                    block.entity.addComponentOrReplace(new ScaleTransformComponent(block.entity.getComponent(Transform).scale, new Vector3(0.1, 0.1, 0.1), offsetRescale * blockTimeTravel, undefined, InterpolationType.EASEINQUAD))
                }))
                block.entity.addComponentOrReplace(new MoveTransformComponent(startPos, endPos, blockTimeTravel * (index + 1), () => {
                    block.Delete()
                }))
            } else {
                block.entity.addComponentOrReplace(new ScaleTransformComponent(block.entity.getComponent(Transform).scale, new Vector3(0.1, 0.1, 0.1), blockTimeTravel * (index + 1), undefined, InterpolationType.EASEINQUAD))
                const startPos = block.entity.getComponent(Transform).position
                const endPos = new Vector3(startPos.x, this.TowerDuel.offsetY - this.TowerDuel.blockScaleY, startPos.z)
                block.entity.addComponentOrReplace(new MoveTransformComponent(startPos, endPos, blockTimeTravel * (index + 1), () => {
                    block.Delete()
                }))
            }
        })

        if ( this.TowerDuel.lift) {
            const posY = this.TowerDuel.offsetY + this.TowerDuel.blockScaleY * (slice + 1)
            const currentLiftPosition = this.TowerDuel.lift.global.getComponent(Transform).position
            this.TowerDuel.lift?.global.addComponentOrReplace(
                new MoveTransformComponent(currentLiftPosition, new Vector3(currentLiftPosition.x, posY, currentLiftPosition.z), (this.TowerDuel.maxCount - slice) * blockTimeTravel, () => {
                    // Relaunch Spawn Blocks
                    this.TowerDuel.currentBlocks = remainingBlocks
                    this.spawnBlock()
                })
            )
        }

    }

    private spawnAnimation(): MoveTransformComponent {
        const posY = this.TowerDuel.offsetY + this.TowerDuel.blockScaleY * this.TowerDuel.currentBlocks.length

        // const startX = 32
        // const startZ = 9 // cant be same as block position (8)
        const spawnerPosition = this.entity.getComponent(Transform).position
        const startX = spawnerPosition.x
        const startZ = spawnerPosition.z // cant be same as block position (8)

        const breakpointMin = 2
        const breakpointMax = 14
        let endZ = startZ >= this.TowerDuel.lastPosition.z ? breakpointMin : breakpointMax

        const adjacent = Math.abs(this.TowerDuel.lastPosition.z - startZ)
        const opposite = Math.abs(this.TowerDuel.lastPosition.x - startX)
        const hypotenuse = Math.sqrt(Math.pow(opposite, 2) + Math.pow(adjacent , 2))
        const angle = Math.asin(opposite / hypotenuse)

        const mainAdjacent = Math.abs(endZ - startZ)
        const mainHypotenuse = mainAdjacent / Math.cos(angle)
        const mainOpposite = Math.sqrt(Math.pow(mainHypotenuse, 2) - Math.pow(mainAdjacent , 2))

        let endX = startX + (startX >= this.TowerDuel.lastPosition.x ? -1 : 1) * mainOpposite

        // Prevent move animation to go outside the game scene on X
        const setEndPosWithBreakpoint = (breakpoint: number) => {
            const oppositeAngle = Math.asin(mainAdjacent / mainHypotenuse)
            const outsideAdjacent = Math.abs(breakpoint - endX)
            const outsideHypotenuse = outsideAdjacent / Math.cos(oppositeAngle)
            const outsideOpposite = Math.sqrt(Math.pow(outsideHypotenuse, 2) - Math.pow(outsideAdjacent , 2))

            endZ = Math.abs(endZ + (startZ >= this.TowerDuel.lastPosition.z ? 1 : -1) * outsideOpposite)
            endX = breakpoint
        }
        if (endX < breakpointMin) {
            setEndPosWithBreakpoint(breakpointMin)
        } else if (endX > breakpointMax) {
            setEndPosWithBreakpoint(breakpointMax)
        }

        let StartPos = new Vector3(startX, posY, startZ)
        let EndPos = new Vector3(endX, posY, endZ)

        return new MoveTransformComponent(StartPos, EndPos, this.spawnSpeed, () => {
            this.TowerDuel.StopBlock()
        })
    }

    private BuildEvents() {
        this.messageBus.on("StarterButton_" + this.TowerDuel.towerDuelId, () => {
            this.spawnBlock()
        })
    }

    public Delete() {
        engine.removeEntity(this.plane)
        engine.removeEntity(this.entity)
        engine.removeEntity(this.spawnInterval)
        this.spawningBlock?.Delete()
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
