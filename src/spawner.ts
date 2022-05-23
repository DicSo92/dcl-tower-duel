import {
    FollowCurvedPathComponent,
    Interval,
    MoveTransformComponent,
    ToggleComponent,
    ToggleState
} from "@dcl/ecs-scene-utils";
import { ITowerDuel } from "@/interfaces/class.interface";
import TowerBlock from "@/towerBlock";
import { GlobalLiftFlag } from "./lift";

export default class Spawner implements ISystem {
    TowerDuel: ITowerDuel
    messageBus: MessageBus

    entity: Entity
    moveDuration: number = 10
    spawnInterval: Entity

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
        engine.addEntity(this.entity)
        this.BuildEvents()

        // this.startSpawn()
    };

    private BuildSpawner() {
        this.entity.addComponent(new BoxShape())
        this.entity.addComponent(new Transform({ scale: new Vector3(1, 0.5, 1) }))

        // Move entity infinitely
        this.entity.addComponent(new ToggleComponent(ToggleState.Off,(value: ToggleState) => {
            const posY = this.TowerDuel.offsetY + 0.4 * this.TowerDuel.blockCount

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

    private startSpawn() {
        this.spawnInterval.addComponent(new Interval(2500, () => {
            const animation = this.spawnAnimation()
            const spawningBlock = new TowerBlock(this.TowerDuel, animation);
            engine.addSystem(spawningBlock);
            if (this.TowerDuel.blockCount >= this.TowerDuel.maxCount) this.spawnInterval.removeComponent(Interval)
        }))
        engine.addEntity(this.spawnInterval)
    }

    private spawnAnimation(): MoveTransformComponent {
        const posY = this.TowerDuel.offsetY + 0.4 * this.TowerDuel.blockCount

        // const startX = 32
        // const startZ = 9 // cant be same as block position (8)
        const spawnerPosition = this.entity.getComponent(Transform).position
        const startX = spawnerPosition.x
        const startZ = spawnerPosition.z // cant be same as block position (8)


        let endZ = startZ >= this.TowerDuel.lastPosition.z ? 0 : 16

        const adjacent = Math.abs(this.TowerDuel.lastPosition.z - startZ)
        const opposite = Math.abs(this.TowerDuel.lastPosition.x - startX)
        const hypotenuse = Math.sqrt(Math.pow(opposite, 2) + Math.pow(adjacent , 2))
        const angle = Math.asin(opposite / hypotenuse)

        const mainAdjacent = Math.abs(endZ - startZ)
        const mainHypotenuse = mainAdjacent / Math.cos(angle)
        const mainOpposite = Math.sqrt(Math.pow(mainHypotenuse, 2) - Math.pow(mainAdjacent , 2))

        let endX = startX + (startX >= this.TowerDuel.lastPosition.x ? -1 : 1) * mainOpposite

        // Prevent move animation to go outside the game scene
        const setEndPosWithBreakpoint = (breakpoint: number) => {
            const oppositeAngle = Math.asin(mainAdjacent / mainHypotenuse)
            const outsideAdjacent = Math.abs(breakpoint - endX)
            const outsideHypotenuse = outsideAdjacent / Math.cos(oppositeAngle)
            const outsideOpposite = Math.sqrt(Math.pow(outsideHypotenuse, 2) - Math.pow(outsideAdjacent , 2))

            endZ = Math.abs(endZ - outsideOpposite)
            endX = breakpoint
        }
        if (endX < 2 ) {
            setEndPosWithBreakpoint(2)
        } else if (endX > 14) {
            setEndPosWithBreakpoint(14)
        }

        log("adjacent", adjacent)
        log("opposite", opposite)
        log("hypotenuse", hypotenuse)
        log("angle", angle)
        log("mainAdjacent", mainAdjacent)
        log("mainHypotenuse", mainHypotenuse)
        log("mainOpposite", mainOpposite)
        log("endX", endX)

        let StartPos = new Vector3(startX, posY, startZ)
        let EndPos = new Vector3(endX, posY, endZ)
        const liftFlags = engine.getComponentGroup(GlobalLiftFlag).entities
        for (let lift in liftFlags) {
            liftFlags[lift].addComponent(new MoveTransformComponent(
                liftFlags[lift].getComponent(Transform).position,
                new Vector3(liftFlags[lift].getComponent(Transform).position.x, posY, liftFlags[lift].getComponent(Transform).position.z),
                2.5))
                
        }

        return new MoveTransformComponent(StartPos, EndPos, 2.5)
    }

    private BuildEvents() {
        this.messageBus.on("greenButtonClick", (test) => {
            log('spawn block')
            const animation = this.spawnAnimation()
            const spawningBlock = new TowerBlock(this.TowerDuel, animation);
            engine.addSystem(spawningBlock);
        })
    }

    public Delete() {
        engine.removeEntity(this.entity)
        engine.removeEntity(this.spawnInterval)
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
