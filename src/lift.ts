import { MoveTransformComponent } from "@dcl/ecs-scene-utils";

export default class Lift implements ISystem {
    entity: Entity
    playerInputs: Input
    step: number = 0
    state: boolean = false
    posX: number = 24
    posZ: number = 14
    startPosY: number = 0.2
    endPosY: number = 10

    constructor(inputs: Input, messageBus: MessageBus) {
        // Lift
        this.entity = new Entity()
        this.entity.addComponent(new Transform({
            position: new Vector3(this.posX, this.startPosY, this.posZ),
            scale: new Vector3(3, 3, 1),
        }))
        this.entity.addComponent(new PlaneShape())
        engine.addEntity(this.entity)
        this.entity.getComponent(Transform).rotation.eulerAngles = new Vector3(90, 0, 0)

        // Instance the input object
        this.playerInputs = inputs
        // button down event
        this.playerInputs.subscribe("BUTTON_UP", ActionButton.PRIMARY, false, (e) => {
            if (this.step === 0 && !this.state) {
                this.step = 1
                this.state = true
                this.moveUp()
            }
        })

        // button up event
        this.playerInputs.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, (e) => {
            if (this.step === 1 && !this.state) {
                this.step = 0
                this.state = true
                this.moveDown()
            }
        })
    }

    moveUp() {
        let StartPos = new Vector3(this.posX, this.startPosY, this.posZ)
        let EndPos = new Vector3(this.posX, this.endPosY, this.posZ)
        this.entity.addComponent(new MoveTransformComponent(StartPos, EndPos, 3, () => { this.state = false }))
     }

    moveDown() {
        let StartPos = new Vector3(this.posX, this.endPosY, this.posZ)
        let EndPos = new Vector3(this.posX, this.startPosY, this.posZ)
        this.entity.addComponent(new MoveTransformComponent(StartPos, EndPos, 3, () => { this.state = false }))
    }

    update(dt: number) {

    }
}
