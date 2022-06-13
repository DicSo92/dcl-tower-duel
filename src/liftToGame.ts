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
    centerPos: Vector3
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
            this.centerPos = new Vector3(24, this.liftMaxHeight, 8)
            this.startPos = new Vector3(24, 0, 24)
            this.endPos = new Vector3(30, 3.3, 2)
        } else {
            this.centerPos = new Vector3(8, this.liftMaxHeight, 8)
            this.startPos = new Vector3(8, 0, 24)
            this.endPos = new Vector3(2, 3.3, 2)
        }
        this.lift = new Entity()
        this.lift.addComponent(this.parent.parent.sceneAssets.soundLiftMove)
        this.lift.getComponent(AudioSource).audioClip.loop = true
        this.lift.addComponent(new Transform({
            position: new Vector3(0, 0.1, 0),
            scale: new Vector3(this.radius, 1, this.radius)
        }))
        this.lift.addComponent(this.parent.parent.gameAssets.liftOpen)

        this.startPath = [
            this.startPos,
            new Vector3(this.startPos.x, this.liftMaxHeight, this.startPos.z),
            this.centerPos,
            new Vector3(this.endPos.x, this.liftMaxHeight, this.endPos.z),
            this.endPos
        ]
        this.endPath = [
            new Vector3(this.endPos.x, this.lift.getComponent(Transform).position.y, this.endPos.z),
            new Vector3(this.endPos.x, this.liftMaxHeight, this.endPos.z),
            this.centerPos,
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

        engine.addEntity(this.entity)
    }

    goToPlay() {
        engine.addSystem(this)
        this.isActive = true
        this.state = 1
        this.entity.addComponent(this.parent.parent.gameAssets.liftOpen)
        this.entity.getComponent(GLTFShape).withCollisions = true
        this.entity.addComponentOrReplace(new utils.FollowPathComponent(this.startPath, this.liftMoveDuration, () => {
            if (this.lift.getComponent(GLTFShape).visible !== false) {
                this.lift.getComponent(GLTFShape).visible = false
                this.entity.getComponent(GLTFShape).visible = false
            }
            this.state = 0
            this.isActive = false
            engine.removeSystem(this)
            return 
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
            const userOutOfLiftY = Camera.instance.position.y < this.entity.getComponent(Transform).position.y - 10 || Camera.instance.position.y > this.entity.getComponent(Transform).position.y + 10
            const userOutOfLiftX = Camera.instance.position.x < this.endPos.x + .5 || Camera.instance.position.x > this.endPos.x + .5
            const userOutOfLiftZ = Camera.instance.position.z < this.endPos.z + .5 || Camera.instance.position.z > this.endPos.z + .5
            if (userOutOfLiftY) {
                log('Player isnt on liftToGame')
                // if (((this.state === 1 && (userOutOfLiftX && userOutOfLiftZ)) || ((this.state === -1 && (userOutOfLiftX && userOutOfLiftZ))))) {
                movePlayerTo(this.state === 1 ? new Vector3(this.endPos.x, this.endPos.y + 2, this.endPos.z) : this.startPos, this.state === 1 ? this.startPos : new Vector3(this.endPos.x, this.endPos.y + 1.4, this.endPos.z))
                if (this.state === 1) {
                    if (this.lift.getComponent(GLTFShape).visible !== false) {
                        this.lift.getComponent(GLTFShape).visible = false
                        this.entity.getComponent(GLTFShape).visible = false
                    }
                    this.state = 0
                    this.isActive = false
                    engine.removeSystem(this)
                } else if (this.state === -1) {
                    this.isActive = false
                    this.state = 0
                    this.entity.removeComponent(GLTFShape)
                    engine.removeSystem(this)
                }
                // }
            }
        }
    }
}
