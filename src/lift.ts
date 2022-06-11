import { MoveTransformComponent } from "@dcl/ecs-scene-utils";
import { ITowerDuel } from "@/interfaces/class.interface";
import GreenButton from "@/greenButton";
import LifeHearts from "./lifeHearts";
import StaminaBar from "@/staminaBar";
import NumericalCounter from "./numericalCounter";
import RedButton from "@/redButton";

export default class Lift implements ISystem {
    TowerDuel: ITowerDuel
    playerInputs: Input

    global: Entity
    lift: Entity
    screen: Entity
    miniScreenLeft: Entity
    miniScreenRight: Entity

    step: number = 0
    state: boolean = false
    startPos: Vector3
    rotation: Vector3
    endPosY: number = 4

    hearts: LifeHearts
    staminaBar: StaminaBar
    numericalCounter: NumericalCounter

    constructor(inputs: Input, towerDuel: ITowerDuel) {
        this.TowerDuel = towerDuel
        if (this.TowerDuel.mainGame.side === 'left') {
            this.startPos = new Vector3(14, 1, 2)
            this.rotation = new Vector3(0, 90, 0)
        } else {
            this.startPos = new Vector3(2, 1, 2)
            this.rotation = new Vector3(0, 180, 0)
        }
        // Global def
        this.global = new Entity()
        this.global.setParent(this.TowerDuel.gameArea)
        this.global.addComponent(new Transform({ position: this.startPos }))
        this.global.getComponent(Transform).rotation.eulerAngles = this.rotation

        // Lift
        this.lift = new Entity()
        this.lift.addComponent(new GLTFShape('models/gameLift.glb'))
        this.lift.addComponent(new Transform({
            position: new Vector3(0, 0, 0)
        }))
        this.lift.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 225, 0)
        this.lift.addComponent(new Animator())
        const diamondAnimation = new AnimationState("DiamondAction", { layer: 0 })
        const ringAnimation = new AnimationState("RingAction", { layer: 1 })
        this.lift.getComponent(Animator).addClip(diamondAnimation)
        this.lift.getComponent(Animator).addClip(ringAnimation)
        diamondAnimation.play()
        ringAnimation.play()
        this.lift.setParent(this.global)

        this.screen = new Entity()
        this.screen.addComponent(new GLTFShape('models/LiftScreen.glb'))
        this.screen.addComponent(new Transform({
            position: new Vector3(-0.75, 0, 0.75)
        }))
        this.screen.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 225, 45)
        this.screen.setParent(this.global)

        this.miniScreenLeft = new Entity()
        this.miniScreenLeft.addComponent(new GLTFShape('models/MiniScreenLift.glb'))
        this.miniScreenLeft.addComponent(new Transform({
            position: new Vector3(-1.5, 0, -0.5)
        }))
        this.miniScreenLeft.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 180, 45)
        this.miniScreenLeft.setParent(this.global)

        this.miniScreenRight = new Entity()
        this.miniScreenRight.addComponent(new GLTFShape('models/MiniScreenLift.glb'))
        this.miniScreenRight.addComponent(new Transform({
            position: new Vector3(0.5, 0, 1.5)
        }))
        this.miniScreenRight.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 270, 45)
        this.miniScreenRight.setParent(this.global)


        // // User Interface
        this.hearts = new LifeHearts(this.TowerDuel, this)
        this.staminaBar = new StaminaBar(this.TowerDuel, this)
        this.numericalCounter = new NumericalCounter(this.TowerDuel, this)

        // Buttons
        const redButton = new RedButton(this.TowerDuel);
        redButton.entity.setParent(this.global)
        const greenButton = new GreenButton(this.TowerDuel);
        greenButton.entity.setParent(this.global)

        // Instance the input object
        this.playerInputs = inputs

        // button down event
        this.playerInputs.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, (e) => {
            this.TowerDuel.StopBlock()
        })
        // button Spell 1
        this.playerInputs.subscribe("BUTTON_DOWN", ActionButton.ACTION_3, false, (e) => {
            log("Key 1 : Speed down spawn")
            if (this.TowerDuel.spawner) this.TowerDuel.spawner.spawnSpeed += .5
        })
        // button Spell 2
        this.playerInputs.subscribe("BUTTON_DOWN", ActionButton.ACTION_4, false, (e) => {
            log("Key 2 : Speed up spawn")
            if (this.TowerDuel.spawner) this.TowerDuel.spawner.spawnSpeed -= .5
        })
        // button Spell 3
        this.playerInputs.subscribe("BUTTON_DOWN", ActionButton.ACTION_5, false, (e) => {
            log("Key 3")
        })
        // button Spell 4
        this.playerInputs.subscribe("BUTTON_DOWN", ActionButton.ACTION_6, false, (e) => {
            log("Key 4")
        })
    }

    public autoMove() {
        const posY = this.TowerDuel.offsetY + this.TowerDuel.blockScaleY * (this.TowerDuel.currentBlocks.length + 1)
        const currentLiftPosition = this.global.getComponent(Transform).position
        this.global.addComponentOrReplace(new MoveTransformComponent(
            currentLiftPosition,
            new Vector3(currentLiftPosition.x, posY, currentLiftPosition.z),
            2.5)
        )
    }

    reset() {
        this.global.addComponentOrReplace(new MoveTransformComponent(this.global.getComponent(Transform).position, this.startPos, 1, () => { this.state = false }))
    }

    moveUp() {
        let StartPos = new Vector3(this.global.getComponent(Transform).position.x, this.startPos.y, this.global.getComponent(Transform).position.z)
        let EndPos = new Vector3(this.global.getComponent(Transform).position.x, this.endPosY, this.global.getComponent(Transform).position.z)
        this.global.addComponent(new MoveTransformComponent(StartPos, EndPos, 3, () => { this.state = false }))
    }

    moveDown() {
        let StartPos = new Vector3(this.global.getComponent(Transform).position.x, this.endPosY, this.global.getComponent(Transform).position.z)
        let EndPos = new Vector3(this.global.getComponent(Transform).position.x, this.startPos.y, this.global.getComponent(Transform).position.z)
        this.global.addComponent(new MoveTransformComponent(StartPos, EndPos, 3, () => { this.state = false }))
    }

    public Delete() {
        engine.removeSystem(this.hearts)
        engine.removeEntity(this.global)
        engine.removeEntity(this.lift)
        engine.removeSystem(this)
    }

    update(dt: number) {

    }
}
