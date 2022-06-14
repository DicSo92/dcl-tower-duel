import * as utils from "@dcl/ecs-scene-utils";
import { movePlayerTo } from "@decentraland/RestrictedActions";
import { BackToLobbyAction } from "./actions/afterTowerDuel";
import { GoToPlayAction } from "./actions/gameApproval";
import MainGame from "./mainGame";

@Component("liftToGame")
export class LiftToGameFlag { }

export default class LiftToGame implements ISystem {
    entity: Entity
    lift: Entity
    parent: MainGame
    startPos: Vector3
    endPos: Vector3
    centerPos0: Vector3
    centerPos1: Vector3
    centerPos2: Vector3
    centerPos3: Vector3
    centerPos4: Vector3
    centerPos5: Vector3
    startPath: Vector3[]
    endPath: Vector3[]
    state: number = 0 // 0: !isActive; 1: goToPlay; -1: goToLobby
    liftMaxHeight: number = 5
    liftCollisionOffset: number = 3
    liftMoveDuration: number = 8
    isActive: boolean = false
    radius: number = 1
    outOfLift: boolean = false

    constructor(parent: MainGame) {
        this.parent = parent
        if (this.parent.side === 'left') {
            this.startPos = new Vector3(24, 0.1, 24)
            this.centerPos0 = new Vector3(24, this.liftMaxHeight, 24)
            this.centerPos1 = new Vector3(24, this.liftMaxHeight, 14)
            this.centerPos2 = new Vector3(30, this.liftMaxHeight, 14)
            this.centerPos3 = new Vector3(30, this.liftMaxHeight, 8)
            this.centerPos4 = new Vector3(30, this.liftMaxHeight + this.liftCollisionOffset, 8)
            this.centerPos5 = new Vector3(30, this.liftMaxHeight + this.liftCollisionOffset, 2)
            this.endPos = new Vector3(30, 3.3, 2)
        } else {
            this.startPos = new Vector3(8, 0.1, 24)
            this.centerPos0 = new Vector3(8, this.liftMaxHeight, 24)
            this.centerPos1 = new Vector3(8, this.liftMaxHeight, 14)
            this.centerPos2 = new Vector3(2, this.liftMaxHeight, 14)
            this.centerPos3 = new Vector3(2, this.liftMaxHeight, 8)
            this.centerPos4 = new Vector3(2, this.liftMaxHeight + this.liftCollisionOffset, 8)
            this.centerPos5 = new Vector3(2, this.liftMaxHeight + this.liftCollisionOffset, 2)
            this.endPos = new Vector3(2, 3.3, 2)
        }
        this.lift = new Entity()
        this.lift.addComponent(this.parent.parent.sceneAssets.soundLiftMove)
        this.lift.getComponent(AudioSource).audioClip.loop = true
        this.lift.addComponent(new Transform({
            position: new Vector3(0, 0.1, 0),
            scale: new Vector3(this.radius, 1, this.radius)
        }))
        this.lift.addComponent(this.parent.parent.gameAssets.liftToGame)

        this.startPath = [
            this.startPos,
            new Vector3(this.startPos.x, this.liftMaxHeight, this.startPos.z),
            this.centerPos0,
            this.centerPos1,
            this.centerPos2,
            this.centerPos3,
            this.centerPos4,
            this.centerPos5,
            new Vector3(this.endPos.x, this.liftMaxHeight, this.endPos.z),
            this.endPos
        ]
        this.endPath = [
            new Vector3(this.endPos.x, this.lift.getComponent(Transform).position.y, this.endPos.z),
            new Vector3(this.endPos.x, this.liftMaxHeight, this.endPos.z),
            this.centerPos5,
            this.centerPos4,
            this.centerPos3,
            this.centerPos2,
            this.centerPos1,
            this.centerPos0,
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

    goToPlay = async (parent: GoToPlayAction) => {
        engine.addSystem(this)
        this.isActive = true
        this.state = 1
        this.entity.addComponent(this.parent.parent.gameAssets.liftToGame)
        this.entity.getComponent(GLTFShape).withCollisions = true
        return this.entity.addComponentOrReplace(new utils.FollowPathComponent(this.startPath, this.liftMoveDuration, () => {
            if (this.lift.getComponent(GLTFShape).visible !== false) {
                this.lift.getComponent(GLTFShape).visible = false
                this.entity.getComponent(GLTFShape).visible = false
            }
            this.state = 0
            this.isActive = false
            engine.removeSystem(this)

            parent.liftToGame.lift.getComponent(AudioSource).playing = false
            const clampX = parent.liftToGame.entity.getComponent(Transform).position.x < Camera.instance.feetPosition.x - 1 || parent.liftToGame.entity.getComponent(Transform).position.x > Camera.instance.feetPosition.x + 1
            const clampZ = parent.liftToGame.entity.getComponent(Transform).position.z < Camera.instance.feetPosition.z - 1 || parent.liftToGame.entity.getComponent(Transform).position.z > Camera.instance.feetPosition.z + 1
            if (clampX || clampZ) {
                movePlayerTo(new Vector3(parent.liftToGame.entity.getComponent(Transform).position.x, parent.liftToGame.entity.getComponent(Transform).position.y + 1, parent.liftToGame.entity.getComponent(Transform).position.z), new Vector3(16, 0, 16))
            }
            parent.hasFinished = true
        }))
    }

    goToLobby = async (parent: BackToLobbyAction) => {
        engine.addSystem(this)
        this.isActive = true
        this.state = -1
        this.lift.getComponent(GLTFShape).visible = true
        this.parent.TowerDuel?.lift?.lift.getComponent(GLTFShape).withCollisions ? this.parent.TowerDuel.lift.lift.getComponent(GLTFShape).withCollisions = false : ''
        return this.entity.addComponentOrReplace(new utils.FollowPathComponent(this.endPath, this.liftMoveDuration, () => {
            this.isActive = false
            this.state = 0
            this.entity.removeComponent(GLTFShape)
            engine.removeSystem(this)

            parent.liftToGame.lift.getComponent(AudioSource).playing = false
            const clampX = parent.liftToGame.entity.getComponent(Transform).position.x < Camera.instance.feetPosition.x - 1 || parent.liftToGame.entity.getComponent(Transform).position.x > Camera.instance.feetPosition.x + 1
            const clampZ = parent.liftToGame.entity.getComponent(Transform).position.z < Camera.instance.feetPosition.z - 1 || parent.liftToGame.entity.getComponent(Transform).position.z > Camera.instance.feetPosition.z + 1
            if (clampX || clampZ) {
                movePlayerTo(this.entity.getComponent(Transform).position, new Vector3(16, 0, 24))
            }
            parent.hasFinished = true
        }))
    }

    update(dt: number) {
        //     if (this.isActive && this.state !== 0) {
        //         const userOutOfLiftY = Camera.instance.feetPosition.y < this.entity.getComponent(Transform).position.y - 1.5 || Camera.instance.position.y > this.entity.getComponent(Transform).position.y + 10
        //         if (userOutOfLiftY) {
        //             movePlayerTo(this.state === 1 ? new Vector3(this.endPos.x, this.endPos.y + 3, this.endPos.z) : this.startPos, this.state === 1 ? this.startPos : new Vector3(this.endPos.x, this.endPos.y + 1.4, this.endPos.z))
        //             if (this.state === 1) {
        //                 if (this.lift.getComponent(GLTFShape).visible !== false) {
        //                     this.lift.getComponent(GLTFShape).visible = false
        //                     this.entity.getComponent(GLTFShape).visible = false
        //                 }
        //                 this.state = 0
        //                 this.isActive = false
        //                 engine.removeSystem(this)
        //             } else if (this.state === -1) {
        //                 this.isActive = false
        //                 this.state = 0
        //                 this.entity.removeComponent(GLTFShape)
        //                 engine.removeSystem(this)
        //             }
        //         }
        //     }
    }
}
