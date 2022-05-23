import * as utils from "@dcl/ecs-scene-utils";
import MainGame from "./mainGame";

@Component("liftToGame")
export class LiftToGameFlag { }

export default class LiftToGame implements ISystem {
    entity: Entity
    lift: Entity
    parent: MainGame
    messageBus: MessageBus
    startPos: Vector3 = new Vector3(19, 0, 24)
    endPos: Vector3 = new Vector3(29, 1, 13)
    startPath: Vector3[]
    endPath: Vector3[]
    pathLength: number
    isActive: boolean = false
    radius: number = 1.5

    constructor(parent: MainGame, messageBus: MessageBus) {
        this.parent = parent
        this.messageBus = messageBus

        this.lift = new Entity()
        this.lift.addComponent(new Transform({
            position: new Vector3(0, 0, 0),
            scale: new Vector3(this.radius, 0.02, this.radius)
        }))
        this.lift.addComponent(new CylinderShape())

        this.startPath = [
            this.startPos,
            new Vector3(this.startPos.x, 6, this.startPos.z),
            new Vector3(22, 6, 19),
            new Vector3(this.endPos.x, 6, this.endPos.z),
            this.endPos
        ]
        this.endPath = [
            new Vector3(this.endPos.x, this.lift.getComponent(Transform).position.y, this.endPos.z),
            new Vector3(this.endPos.x, 6, this.endPos.z),
            new Vector3(22, 6, 19),
            new Vector3(this.startPos.x, 6, this.startPos.z),
            this.startPos,
        ]
        this.pathLength = this.startPath.length

        this.entity = new Entity()
        this.entity.addComponent(new LiftToGameFlag())
        this.entity.addComponent(new Transform({
            position: this.startPos,
            scale: new Vector3(1, 1, 1)
        }))
        this.lift.setParent(this.entity)

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

    }

    goToPlay() {
        this.isActive = true
        this.entity.addComponent(new utils.FollowPathComponent(this.startPath, this.pathLength, () => {
            this.lift.getComponent(CylinderShape).visible = false
            this.isActive = false
        }))
    }

    goToLobby() {
        this.lift.getComponent(CylinderShape).visible = true
        this.isActive = true
        this.entity.addComponent(new utils.FollowPathComponent(this.endPath, this.pathLength, () => {
            this.isActive = false
        }))
    }

    update() {

    }
}
