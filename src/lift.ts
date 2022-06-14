import { MoveTransformComponent } from "@dcl/ecs-scene-utils";
import TowerDuel from "@/towerDuel";
import LifeHearts from "./lifeHearts";
import StaminaBar from "@/staminaBar";
import NumericalCounter from "./numericalCounter";
import * as utils from "@dcl/ecs-scene-utils";
import { BackToLiftToGamePositionAction } from "./actions/afterTowerDuel";

export default class Lift implements ISystem {
    TowerDuel: TowerDuel
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
    minPosY: number = 3.4

    hearts: LifeHearts
    staminaBar: StaminaBar
    numericalCounter: NumericalCounter
    spell1cost: number = 3
    spell2cost: number = 3
    spell2EffectDuration: number = 5000 // millisec
    spell3cost: number = 3
    spell3EffectDuration: number = 5000 // millisec

    constructor(inputs: Input, towerDuel: TowerDuel) {
        this.TowerDuel = towerDuel
        if (this.TowerDuel.mainGame.side === 'left') {
            this.startPos = new Vector3(13.6, this.minPosY, 2.4)
            this.rotation = new Vector3(0, 180, 0)

        } else {
            this.startPos = new Vector3(2.4, this.minPosY, 2.4)
            this.rotation = new Vector3(0, -90, 0)
        }
        // Global def
        this.global = new Entity()
        this.global.setParent(this.TowerDuel.gameArea)
        this.global.addComponent(new Transform({ position: this.startPos }))
        this.global.getComponent(Transform).rotation.eulerAngles = this.rotation

        // Lift
        this.lift = new Entity()
        const liftShape = new GLTFShape('models/gameLift.glb')

        this.lift.addComponent(liftShape)
        this.lift.addComponent(new Transform({
            position: new Vector3(0, 0, 0)
        }))
        this.lift.addComponent(new Animator())
        const diamondAnimation = new AnimationState("DiamondAction", { layer: 0 })
        const ringAnimation = new AnimationState("RingAction", { layer: 1 })
        this.lift.getComponent(Animator).addClip(diamondAnimation)
        this.lift.getComponent(Animator).addClip(ringAnimation)
        diamondAnimation.play()
        ringAnimation.play()
        this.lift.setParent(this.global)
        // -------------------------------------------------------------------------------------------------------------
        this.screen = new Entity()
        this.screen.addComponent(new GLTFShape('models/LiftScreen.glb'))
        this.screen.addComponent(new Transform({
            position: new Vector3(0.75, 0, -0.75)
        }))
        this.screen.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 45, 45)
        this.screen.addComponent(
            new OnPointerDown(() => {
                this.TowerDuel.StopBlock()
            }, {
                button: ActionButton.POINTER,
                showFeedback: false,
                // hoverText: "Stop Block",
            })
        )
        this.screen.setParent(this.global)

        const screenText = new Entity()
        screenText.addComponent(new PlaneShape())
        const screenTextMaterial = new BasicMaterial()
        screenTextMaterial.texture = new Texture("images/ScreenText.png")
        screenText.addComponent(screenTextMaterial)
        screenText.addComponent(new Transform({
            position: new Vector3(0.6, 0, 0),
            scale: new Vector3(1, 1, 1)
        }))
        screenText.getComponent(Transform).rotation.eulerAngles = new Vector3(90, 90, 180)
        screenText.setParent(this.screen)

        // -------------------------------------------------------------------------------------------------------------

        this.miniScreenLeft = new Entity()
        this.miniScreenLeft.addComponent(new GLTFShape('models/MiniScreenLift.glb'))
        this.miniScreenLeft.addComponent(new Transform({
            position: new Vector3(1.5, 0, 0.5)
        }))
        this.miniScreenLeft.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 0, 45)
        this.miniScreenLeft.setParent(this.global)

        // -------------------------------------------------------------------------------------------------------------

        this.miniScreenRight = new Entity()
        this.miniScreenRight.addComponent(new GLTFShape('models/MiniScreenLift.glb'))
        this.miniScreenRight.addComponent(new Transform({
            position: new Vector3(-0.5, 0, -1.5)
        }))
        this.miniScreenRight.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 45)
        this.miniScreenRight.setParent(this.global)

        const miniScreenRightText = new Entity()
        miniScreenRightText.addComponent(new PlaneShape())
        const miniScreenRightTextMaterial = new BasicMaterial()
        miniScreenRightTextMaterial.texture = new Texture("images/MiniScreenText.png")
        miniScreenRightText.addComponent(miniScreenRightTextMaterial)
        miniScreenRightText.addComponent(new Transform({
            position: new Vector3(0.36, 0.05, 0),
            scale: new Vector3(0.75, 0.3, 1)
        }))
        miniScreenRightText.getComponent(Transform).rotation.eulerAngles = new Vector3(90, 90, 180)
        miniScreenRightText.setParent(this.miniScreenRight)

        // -------------------------------------------------------------------------------------------------------------

        // // User Interface
        this.hearts = new LifeHearts(this.TowerDuel, this)
        this.staminaBar = new StaminaBar(this.TowerDuel, this)
        this.numericalCounter = new NumericalCounter(this.TowerDuel, this)

        // Instance the input object
        this.playerInputs = inputs

        // button down event
        this.playerInputs.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, (e) => {
            if (this.TowerDuel.mainGame.isActive) {
                this.TowerDuel.StopBlock()
            }
        })
        // button Spell 1
        this.playerInputs.subscribe("BUTTON_DOWN", ActionButton.ACTION_3, false, (e) => {
            log("Key 1 : Speed down spawn")
            if (this.staminaBar.staminaCount - this.spell1cost >= 0 && this.TowerDuel.mainGame.isActive) {
                this.TowerDuel.lift?.staminaBar.entity.getComponent(AudioSource).playOnce()
                // if (this.TowerDuel.spawner) this.TowerDuel.spawner.spawnSpeed += .5
                this.TowerDuel.messageBus.emit("removeStamina_" + this.TowerDuel.towerDuelId, { cost: this.spell1cost })
            }
        })
        // button Spell 2
        this.playerInputs.subscribe("BUTTON_DOWN", ActionButton.ACTION_4, false, (e) => {
            log("Key 2 : Speed up spawn")
            if (this.staminaBar.staminaCount - this.spell2cost >= 0 && this.TowerDuel.mainGame.isActive) {
                this.TowerDuel.lift?.staminaBar.entity.getComponent(AudioSource).playOnce()

                const oldSpeed = this.TowerDuel.spawner?.spawnSpeed ? this.TowerDuel.spawner?.spawnSpeed : 3
                if (this.TowerDuel.spawner) this.TowerDuel.spawner.spawnSpeed += 1

                this.TowerDuel.spawner?.entity.addComponentOrReplace(new utils.Delay(this.spell2EffectDuration, () => {
                    if (this.TowerDuel.spawner) this.TowerDuel.spawner.spawnSpeed = oldSpeed
                }))
                this.TowerDuel.messageBus.emit("removeStamina_" + this.TowerDuel.towerDuelId, { cost: this.spell2cost })
            }
        })
        // button Spell 3
        this.playerInputs.subscribe("BUTTON_DOWN", ActionButton.ACTION_5, false, (e) => {
            log("Key 3 : Increase margin error")
            if (this.staminaBar.staminaCount - this.spell3cost >= 0 && this.TowerDuel.mainGame.isActive) {
                this.TowerDuel.lift?.staminaBar.entity.getComponent(AudioSource).playOnce()

                const oldMargin = this.TowerDuel.spawner?.spawningBlock?.marginError ? this.TowerDuel.spawner?.spawningBlock?.marginError : .15
                if (this.TowerDuel.spawner?.spawningBlock) { this.TowerDuel.spawner.spawningBlock.marginError += .25 }

                this.TowerDuel.spawner?.entity.addComponentOrReplace(new utils.Delay(this.spell3EffectDuration, () => {
                    if (this.TowerDuel.spawner?.spawningBlock) { this.TowerDuel.spawner.spawningBlock.marginError = oldMargin }
                }))
                this.TowerDuel.messageBus.emit("removeStamina_" + this.TowerDuel.towerDuelId, { cost: this.spell3cost })
            }
        })
    }

    public autoMove() {
        const posY = this.TowerDuel.offsetY + this.TowerDuel.blockScaleY * (this.TowerDuel.currentBlocks.length + 1)
        const currentLiftPosition = this.global.getComponent(Transform).position
        this.global.addComponentOrReplace(new MoveTransformComponent(
            currentLiftPosition,
            new Vector3(currentLiftPosition.x, posY >= this.minPosY ? posY : this.minPosY, currentLiftPosition.z),
            2.5)
        )
    }

    reset = async (parent: BackToLiftToGamePositionAction) => {
        return this.global.addComponentOrReplace(new MoveTransformComponent(this.global.getComponent(Transform).position, this.startPos, 1, () => {
            this.state = false
            parent.hasFinished = true
        }))
    }

    public Delete() {
        this.TowerDuel.lift = undefined
        engine.removeSystem(this.hearts)
        engine.removeEntity(this.global)
        engine.removeEntity(this.lift)
        engine.removeSystem(this)
    }

    update(dt: number) {

    }
}
