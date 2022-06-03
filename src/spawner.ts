import {
    Delay,
    FollowCurvedPathComponent, InterpolationType,
    MoveTransformComponent, ScaleTransformComponent,
    ToggleComponent,
    ToggleState
} from "@dcl/ecs-scene-utils";
import { ITowerDuel } from "@/interfaces/class.interface";
import TowerBlock from "@/towerBlock";

export default class Spawner implements ISystem {
    TowerDuel: ITowerDuel
    messageBus: MessageBus

    entity: Entity
    moveDuration: number = 10
    spawnInterval: Entity
    spawningBlock?: TowerBlock
    spawnSpeed: number = 3

    constructor(towerDuel: ITowerDuel) {
        this.TowerDuel = towerDuel
        this.messageBus = this.TowerDuel.messageBus

        this.entity = new Entity();
        this.entity.setParent(this.TowerDuel.gameArea)
        this.spawnInterval = new Entity()

        this.Init();
    }

    Init = () => {
        this.BuildSpawner()
        this.entity.getComponent(ToggleComponent).toggle()
        engine.addSystem(this)
        this.BuildEvents()
    };

    private BuildSpawner() {
        let box = new BoxShape()
        box.withCollisions = false
        this.entity.addComponent(box)
        this.entity.addComponent(new Transform({ scale: new Vector3(1, 0.5, 1) }))

        // Move entity infinitely
        this.entity.addComponent(new ToggleComponent(ToggleState.Off,(value: ToggleState) => {
            const posY = this.TowerDuel.offsetY + this.TowerDuel.blockScaleY * this.TowerDuel.currentBlocks.length

            //Define the positions of the path for move animation
            let path = [
                new Vector3(13, posY, 1),
                new Vector3(15, posY, 3),
                new Vector3(15, posY, 13),
                new Vector3(13, posY, 15),
                new Vector3(3, posY, 15),
                new Vector3(1, posY, 13),
                new Vector3(1, posY, 3),
                new Vector3(3, posY, 1),
            ]
            this.entity.addComponentOrReplace(
                this.entity.addComponent(new FollowCurvedPathComponent(path, this.moveDuration, 25, true, true, () => {
                    log('curve finished')
                    this.entity.getComponent(ToggleComponent).toggle()
                }))
            )})
        )
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
    }

    maxCountReachedAnimation() {
        const blockTimeTravel = 0.2
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

        return new MoveTransformComponent(StartPos, EndPos, this.spawnSpeed)
    }

    private BuildEvents() {
        this.messageBus.on("StarterButton_" + this.TowerDuel.towerDuelId, () => {
            this.spawnBlock()
        })
    }

    public Delete() {
        engine.removeEntity(this.entity)
        engine.removeEntity(this.spawnInterval)
        this.spawningBlock?.Delete()
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
