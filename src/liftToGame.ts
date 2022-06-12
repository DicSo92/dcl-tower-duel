import * as utils from "@dcl/ecs-scene-utils";
import MainGame from "./mainGame";

@Component("liftToGame")
export class LiftToGameFlag { }

export default class LiftToGame implements ISystem {
    entity: Entity
    lift: Entity
    parent: MainGame
    startPos: Vector3
    endPos: Vector3
    startPath: Vector3[]
    endPath: Vector3[]
    pathLength: number
    isActive: boolean = false
    radius: number = 1.5

    constructor(parent: MainGame) {
        this.parent = parent
        if (this.parent.side === 'left') {
            this.startPos = new Vector3(24, 0, 24)
            this.endPos = new Vector3(30, 3.4, 2)
        } else {
            this.startPos = new Vector3(8, 0, 24)
            this.endPos = new Vector3(2, 3.4, 2)
        }
        this.lift = new Entity()
        this.lift.addComponent(new Transform({
            position: new Vector3(0, 0, 0),
            scale: new Vector3(this.radius, 1, this.radius)
        }))
        this.lift.addComponent(this.parent.parent.gameAssets.liftOpen)
        // const animator = new Animator()
        // animator.addClip(new AnimationState('active', { layer: 0 }))
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
        this.entity.addComponent(this.parent.parent.gameAssets.liftOpen)
        // this.entity.addComponent(this.parent.parent.gameAssets.liftClose)
        this.entity.getComponent(GLTFShape).withCollisions = true
        this.entity.addComponent(new utils.Delay(2000, () => {
            this.entity.addComponentOrReplace(new utils.FollowPathComponent(this.startPath, this.pathLength, () => {
                if (this.lift.getComponent(GLTFShape).visible !== false) {
                    this.lift.getComponent(GLTFShape).visible = false
                    this.entity.getComponent(GLTFShape).visible = false
                    // this.entity.removeComponent(this.parent.parent.gameAssets.liftClose)
                }
                this.isActive = false
            }))
        }))
    }

    goToLobby() {
        this.isActive = true
        // this.entity.addComponent(this.parent.parent.gameAssets.liftClose)
        this.lift.getComponent(GLTFShape).visible = true
        this.entity.addComponentOrReplace(new utils.FollowPathComponent(this.endPath, this.pathLength, () => {
            this.isActive = false
            this.entity.removeComponent(GLTFShape)
        }))
    }

    update() {

    }
}
