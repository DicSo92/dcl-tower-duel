import { MoveTransformComponent } from "@dcl/ecs-scene-utils";

@Component("GlobalLiftFlag")
export class GlobalLiftFlag { }

//  @class Lift
//      @param:
//          global: Parent entity for phisicals group (lift and buttons)
//          lift: Real lift PlaneShape Entity
export default class Lift implements ISystem {
    global: Entity = new Entity()
    lift: Entity
    playerInputs: Input
    step: number = 0
    state: boolean = false
    startPosY: number = .2
    endPosY: number = 4

    constructor(inputs: Input, messageBus: MessageBus) {
        // Global def
        this.global.addComponent(new Transform({
            position: new Vector3(24, this.startPosY, 16),
            scale: new Vector3(1, 1, 1)
        }))
        this.global.getComponent(Transform).rotation.eulerAngles = new Vector3(0, -180, 0)
        this.global.addComponent(new GlobalLiftFlag())
        engine.addEntity(this.global)

        // Lift
        this.lift = new Entity()
        this.lift.addComponent(new Transform({
            position: new Vector3(0, 0, 0),
            scale: new Vector3(4, 3, 1),
        }))
        this.lift.addComponent(new PlaneShape())
        this.lift.getComponent(Transform).rotation.eulerAngles = new Vector3(90, 0, 0)
        this.lift.setParent(this.global)

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
        let StartPos = new Vector3(this.global.getComponent(Transform).position.x, this.startPosY, this.global.getComponent(Transform).position.z)
        let EndPos = new Vector3(this.global.getComponent(Transform).position.x, this.endPosY, this.global.getComponent(Transform).position.z)
        this.global.addComponent(new MoveTransformComponent(StartPos, EndPos, 3, () => { this.state = false }))
    }

    moveDown() {
        let StartPos = new Vector3(this.global.getComponent(Transform).position.x, this.endPosY, this.global.getComponent(Transform).position.z)
        let EndPos = new Vector3(this.global.getComponent(Transform).position.x, this.startPosY, this.global.getComponent(Transform).position.z)
        this.global.addComponent(new MoveTransformComponent(StartPos, EndPos, 3, () => { this.state = false }))
    }

    update(dt: number) {

    }
}

// import { MoveTransformComponent } from "@dcl/ecs-scene-utils";

// export default class Lift implements ISystem {
//     entity: Entity
//     playerInputs: Input
//     step: number = 0
//     state: boolean = false
//     posX: number = 24
//     posZ: number = 14
//     startPosY: number = 0.2
//     endPosY: number = 10

//     constructor(inputs: Input, messageBus: MessageBus) {
//         // Lift
//         this.entity = new Entity()
//         this.entity.addComponent(new Transform({
//             position: new Vector3(this.posX, this.startPosY, this.posZ),
//             scale: new Vector3(3, 3, 1),
//         }))
//         this.entity.addComponent(new PlaneShape())
//         engine.addEntity(this.entity)
//         this.entity.getComponent(Transform).rotation.eulerAngles = new Vector3(90, 0, 0)

//         // Instance the input object
//         this.playerInputs = inputs
//         // button down event
//         this.playerInputs.subscribe("BUTTON_UP", ActionButton.PRIMARY, false, (e) => {
//             if (this.step === 0 && !this.state) {
//                 this.step = 1
//                 this.state = true
//                 this.moveUp()
//             }
//         })

//         // button up event
//         this.playerInputs.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, (e) => {
//             if (this.step === 1 && !this.state) {
//                 this.step = 0
//                 this.state = true
//                 this.moveDown()
//             }
//         })
//     }

//     moveUp() {
//         let StartPos = new Vector3(this.posX, this.startPosY, this.posZ)
//         let EndPos = new Vector3(this.posX, this.endPosY, this.posZ)
//         this.entity.addComponent(new MoveTransformComponent(StartPos, EndPos, 3, () => { this.state = false }))
//      }

//     moveDown() {
//         let StartPos = new Vector3(this.posX, this.endPosY, this.posZ)
//         let EndPos = new Vector3(this.posX, this.startPosY, this.posZ)
//         this.entity.addComponent(new MoveTransformComponent(StartPos, EndPos, 3, () => { this.state = false }))
//     }

//     update(dt: number) {

//     }
// }
