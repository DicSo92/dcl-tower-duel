import * as utils from "@dcl/ecs-scene-utils";
import MainGame from "./mainGame";

@Component("liftToGame")
export class LiftToGameFlag { }

export default class LiftToGame implements ISystem {
    entity: Entity
    selector: Entity
    parent: MainGame
    messageBus: MessageBus
    startPos: Vector3 = new Vector3(19, 0, 24)
    endPos: Vector3 = new Vector3(24, 0, 16)
    startPath: Vector3[]
    endPath: Vector3[]
    pathLength: number
    isActive: boolean = false
    radius: number = 1.5

    constructor(parent: MainGame, messageBus: MessageBus) {
        this.parent = parent
        this.messageBus = messageBus
        
        this.startPath = [
            this.startPos,
            new Vector3(20, 6, 21),
            new Vector3(22, 6, 19),
            new Vector3(24, 6, 16),
            this.endPos
        ]
        this.endPath = [
            this.endPos,
            new Vector3(24, 6, 16),
            new Vector3(22, 6, 19),
            new Vector3(20, 6, 21),
            this.startPos,
        ]
        this.pathLength = this.startPath.length
        this.entity = new Entity()
        this.entity.addComponent(new LiftToGameFlag())
        this.entity.addComponent(new Transform({
            position: this.startPos,
            scale: new Vector3(1, 1, 1)
        }))

        let triggerSphere = new utils.TriggerSphereShape()
        this.entity.addComponent(new utils.TriggerComponent(triggerSphere, {
            onCameraEnter: () => {
                log("enter trigger modeSelection")
                if (!this.parent.isActive && !this.isActive) {
                    this.messageBus.emit("modeSelection", {
                        test: "Emit modeSelection"
                    })
                }
            },
            onCameraExit: () => {
                log("exit trigger modeSelection")
                if (!this.parent.isActive && !this.isActive) {
                    this.messageBus.emit("modeSelectionExit", {
                        test: "Emit modeSelectionExit"
                    })
                }
            }
        }))

        engine.addEntity(this.entity)

        this.selector = new Entity()
        this.selector.setParent(this.entity)
        this.selector.addComponent(new Transform({
            position: new Vector3(0, 0, 0),
            scale: new Vector3(this.radius,0.02,this.radius)
        }))
        this.selector.addComponent(new CylinderShape())
    }

    goToPlay() {
        this.isActive = true
        this.entity.addComponent(new utils.FollowPathComponent(this.startPath, this.pathLength, () => {
            this.isActive = false
        }))
    }

    goToLobby() {
        this.isActive = true
        this.entity.addComponent(new utils.FollowPathComponent(this.endPath, this.pathLength, () => {
            this.isActive = false
        }))
    }

    update() {

    }
}
