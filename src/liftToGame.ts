import * as utils from "@dcl/ecs-scene-utils";
import MainGame from "./mainGame";

@Component("liftToGame")
export class LiftToGameFlag { }

export default class LiftToGame implements ISystem {
    entity: Entity
    lift: Entity
    parent: MainGame
    startPos: Vector3 = new Vector3(19, 0, 24)
    endPos: Vector3 = new Vector3(30, 1, 2)
    startPath: Vector3[]
    endPath: Vector3[]
    pathLength: number
    isActive: boolean = false
    radius: number = 2

    constructor(parent: MainGame) {
        this.parent = parent

        this.lift = new Entity()
        this.lift.addComponent(new Transform({
            position: new Vector3(0, 0, 0),
            scale: new Vector3(this.radius, 1, this.radius)
        }))
        this.lift.addComponent(new GLTFShape('models/openedLiftToGame.glb'))
        // const animator = new Animator()
        // animator.addClip(new AnimationState('UpAndDown'))
        // this.lift.addComponent(animator)
        
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

        let triggerSphere = new utils.TriggerSphereShape(2.5)
        this.entity.addComponent(new utils.TriggerComponent(triggerSphere, {
            onCameraEnter: () => {
                // log("enter trigger modeSelection")
                if (!this.parent.isActive && !this.isActive) {
                    this.parent.modeSelection('in')
                }
            },
            onCameraExit: () => {
                // log("exit trigger modeSelection")
                if (!this.parent.isActive && !this.isActive) {
                    this.parent.modeSelection('out')
                }
            }
        }))

        engine.addEntity(this.entity)

        // this.lift.getComponent(Animator).getClip('UpAndDown').reset()
        // this.lift.getComponent(Animator).getClip('UpAndDown').play()
    }

    goToPlay() {
        this.isActive = true
        this.entity.addComponent(new utils.FollowPathComponent(this.startPath, this.pathLength, () => {
            if (this.lift.getComponent(GLTFShape).visible !== false) {
                this.lift.getComponent(GLTFShape).visible = false
            }
            this.isActive = false
        }))
    }

    goToLobby() {
        this.isActive = true
        this.lift.getComponent(GLTFShape).visible = true
        this.entity.addComponent(new utils.FollowPathComponent(this.endPath, this.pathLength, () => {
            this.isActive = false
        }))
    }

    update() {

    }
}
