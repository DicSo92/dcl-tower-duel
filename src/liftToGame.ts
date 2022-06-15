import { FollowPathComponent } from "@dcl/ecs-scene-utils";
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
    liftStartHeight: number = 0.1
    liftEndHeight: number = 3.5
    liftCollisionOffset: number = 3
    liftMoveDuration: number = 8
    isActive: boolean = false
    outOfLift: boolean = false

    constructor(parent: MainGame) {
        this.parent = parent
        if (this.parent.side === 'left') {
            this.startPos = new Vector3(24, this.liftStartHeight, 24)
            this.centerPos0 = new Vector3(24, this.liftMaxHeight, 24)
            this.centerPos1 = new Vector3(24, this.liftMaxHeight, 14)
            this.centerPos2 = new Vector3(28, this.liftMaxHeight + (this.liftCollisionOffset/2), 12)
            this.centerPos3 = new Vector3(30, this.liftMaxHeight + this.liftCollisionOffset, 8)
            this.centerPos4 = new Vector3(30, this.liftMaxHeight + this.liftCollisionOffset, 8)
            this.centerPos5 = new Vector3(30, this.liftMaxHeight + this.liftCollisionOffset, 2)
            this.endPos = new Vector3(30, this.liftEndHeight, 2)
        } else {
            this.startPos = new Vector3(8, this.liftStartHeight, 24)
            this.centerPos0 = new Vector3(8, this.liftMaxHeight, 24)
            this.centerPos1 = new Vector3(8, this.liftMaxHeight, 14)
            this.centerPos2 = new Vector3(4, this.liftMaxHeight + (this.liftCollisionOffset / 2), 12)
            this.centerPos3 = new Vector3(2, this.liftMaxHeight + this.liftCollisionOffset, 8)
            this.centerPos4 = new Vector3(2, this.liftMaxHeight + this.liftCollisionOffset, 8)
            this.centerPos5 = new Vector3(2, this.liftMaxHeight + this.liftCollisionOffset, 2)
            this.endPos = new Vector3(2, this.liftEndHeight, 2)
        }
        this.lift = new Entity()
        this.lift.addComponent(this.parent.parent.sceneAssets.soundLiftMove)
        this.lift.getComponent(AudioSource).audioClip.loop = true
        this.lift.addComponent(new Transform({
            position: new Vector3(0, this.liftStartHeight, 0),
        }))
        this.lift.addComponent(this.parent.parent.gameAssets.liftToGame)

        this.startPath = [
            this.startPos,
            this.centerPos0,
            this.centerPos1,
            this.centerPos2,
            this.centerPos3,
            this.centerPos4,
            this.centerPos5,
            this.endPos
        ]
        this.endPath = [
            this.endPos,
            this.centerPos5,
            this.centerPos4,
            this.centerPos3,
            this.centerPos2,
            this.centerPos1,
            this.centerPos0,
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

    getColliders(): Entity {
        const colliderContainer = new Entity()
        colliderContainer.setParent(this.lift)
        const colliderScale = new Vector3(3, 3, 1)

        const leftCollider = new Entity()
        leftCollider.addComponent(new PlaneShape())
        leftCollider.getComponent(PlaneShape).visible = false
        leftCollider.addComponent(new Transform({
            position: new Vector3(-1.5, colliderScale.y / 2, 0),
            scale: colliderScale
        }))
        leftCollider.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 0)
        leftCollider.setParent(colliderContainer)
        // -----------------------------------------------
        const rightCollider = new Entity()
        rightCollider.addComponent(new PlaneShape())
        rightCollider.getComponent(PlaneShape).visible = false
        rightCollider.addComponent(new Transform({
            position: new Vector3(1.5, colliderScale.y / 2, 0),
            scale: colliderScale
        }))
        rightCollider.getComponent(Transform).rotation.eulerAngles = new Vector3(0, -90, 0)
        rightCollider.setParent(colliderContainer)
        // -----------------------------------------------
        const botCollider = new Entity()
        botCollider.addComponent(new PlaneShape())
        botCollider.getComponent(PlaneShape).visible = false
        botCollider.addComponent(new Transform({
            position: new Vector3(0, colliderScale.y / 2, 1.5),
            scale: colliderScale

        }))
        botCollider.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 0, 0)
        botCollider.setParent(colliderContainer)
        // -----------------------------------------------
        const topCollider = new Entity()
        topCollider.addComponent(new PlaneShape())
        topCollider.getComponent(PlaneShape).visible = false
        topCollider.addComponent(new Transform({
            position: new Vector3(0, colliderScale.y / 2, -1.5),
            scale: colliderScale

        }))
        topCollider.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 0, 0)
        topCollider.setParent(colliderContainer)

        return colliderContainer
    }

    goToPlay = async (parent: GoToPlayAction) => {
        engine.addSystem(this)
        this.isActive = true
        this.state = 1
        this.entity.addComponent(this.parent.parent.gameAssets.liftToGame)
        this.entity.getComponent(GLTFShape).withCollisions = true

        const colliderContainer = this.getColliders()
        return this.entity.addComponentOrReplace(new FollowPathComponent(this.startPath, this.liftMoveDuration, () => {
            engine.removeEntity(colliderContainer)

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

        const colliderContainer = this.getColliders()
        return this.entity.addComponentOrReplace(new FollowPathComponent(this.endPath, this.liftMoveDuration, () => {
            engine.removeEntity(colliderContainer)

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

    update(dt: number) { }
}
