import * as utils from "@dcl/ecs-scene-utils";
import { movePlayerTo } from "@decentraland/RestrictedActions";
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
    state: number = 0 // 0: !isActive; 1: goToPlay; -1: goToLobby
    liftMaxHeight: number = 25
    liftMoveDuration: number = 8
    isActive: boolean = false
    radius: number = 1.5
    outOfLift: boolean = false

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
        this.lift.addComponent(this.parent.parent.sceneAssets.soundLiftMove)
        this.lift.getComponent(AudioSource).audioClip.loop = true
        this.lift.addComponent(new Transform({
            position: new Vector3(0, 0.1, 0),
            scale: new Vector3(this.radius, 1, this.radius)
        }))
        this.lift.addComponent(this.parent.parent.gameAssets.liftOpen)
        // const animator = new Animator()
        // animator.addClip(new AnimationState('active', { layer: 0 }))
        // this.lift.addComponent(animator)

        this.startPath = [
            this.startPos,
            new Vector3(this.startPos.x, this.liftMaxHeight, this.startPos.z),
            new Vector3(22, this.liftMaxHeight, 19),
            new Vector3(this.endPos.x, this.liftMaxHeight, this.endPos.z),
            this.endPos
        ]
        this.endPath = [
            new Vector3(this.endPos.x, this.lift.getComponent(Transform).position.y, this.endPos.z),
            new Vector3(this.endPos.x, this.liftMaxHeight, this.endPos.z),
            new Vector3(22, this.liftMaxHeight, 19),
            new Vector3(this.startPos.x, this.liftMaxHeight, this.startPos.z),
            this.startPos,
        ]

        this.entity = new Entity()
        this.entity.addComponent(this.parent.parent.sceneAssets.soundTeleport)
        this.entity.addComponent(new LiftToGameFlag())
        this.entity.addComponent(new Transform({
            position: this.startPos,
            scale: new Vector3(1, 1, 1)
        }))
        this.lift.setParent(this.entity)

        // let triggerSphere = new utils.TriggerSphereShape(2.5)
        // this.entity.addComponent(new utils.TriggerComponent(triggerSphere, {
        //     onCameraEnter: () => {
        //         // log("enter trigger modeSelection")
        //         if (!this.parent.isActive && !this.isActive) {
        //             this.parent.modeSelection('in')
        //         }
        //     },
        //     onCameraExit: () => {
        //         // log("exit trigger modeSelection")
        //         if (!this.parent.isActive && !this.isActive) {
        //             this.parent.modeSelection('out')
        //         }
        //     }
        // }))

        engine.addEntity(this.entity)

        // this.lift.getComponent(Animator).getClip('UpAndDown').reset()
        // this.lift.getComponent(Animator).getClip('UpAndDown').play()
    }

    goToPlay() {
        engine.addSystem(this)
        this.isActive = true
        this.state = 1
        this.entity.addComponent(this.parent.parent.gameAssets.liftOpen)
        this.entity.getComponent(GLTFShape).withCollisions = true
        this.entity.addComponent(new utils.Delay(2000, () => {
            this.entity.addComponentOrReplace(new utils.FollowPathComponent(this.startPath, this.liftMoveDuration, () => {
                if (this.lift.getComponent(GLTFShape).visible !== false) {
                    this.lift.getComponent(GLTFShape).visible = false
                    this.entity.getComponent(GLTFShape).visible = false
                }
                this.state = 0
                this.isActive = false
                engine.removeSystem(this)
            }))
        }))
    }

    goToLobby() {
        engine.addSystem(this)
        this.isActive = true
        this.state = -1
        this.lift.getComponent(GLTFShape).visible = true
        this.entity.addComponentOrReplace(new utils.FollowPathComponent(this.endPath, this.liftMoveDuration, () => {
            this.isActive = false
            this.state = 0
            this.entity.removeComponent(GLTFShape)
            engine.removeSystem(this)
        }))
    }

    update(dt: number) {
        // log('liftToGame update')
        if (this.isActive && this.state !== 0) {
            // log('liftToGame isActive')
            if (Camera.instance.position.y < this.entity.getComponent(Transform).position.y - 10 || Camera.instance.position.y > this.entity.getComponent(Transform).position.y + 10) {
                log('Player isnt on liftToGame')
                if ((this.state === 1 && (Camera.instance.position.x !== this.endPos.x && Camera.instance.position.z !== this.endPos.z) || (this.state === -1 && (Camera.instance.position.x !== this.endPos.x && Camera.instance.position.z !== this.endPos.z)))) {
                    const nextPos = new Vector3(this.endPos.x, this.endPos.y + 1.4, this.endPos.z)
                    movePlayerTo(this.state === 1 ? nextPos : this.startPos, this.state === 1 ? new Vector3(8, 0, 24) : nextPos)}
                // movePlayerTo(this.entity.getComponent(Transform).position, Camera.instance.rotation.eulerAngles)
            }
        }
    }
}
