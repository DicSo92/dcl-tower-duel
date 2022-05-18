export class Lift implements ISystem {
    entity: Entity

    constructor(messageBus: MessageBus) {
        // Lift
        this.entity = new Entity()
        this.entity.addComponent(new Transform({
            position: new Vector3(6, 1, 8),
            scale: new Vector3(3, 3, 1),
        }))
        this.entity.addComponent(new PlaneShape())
        engine.addEntity(this.entity)
        this.entity.getComponent(Transform).rotation.eulerAngles = new Vector3(90, 0, 0)
        
        // Instance the input object
        const input = Input.instance

        // button down event
        input.subscribe("BUTTON_UP", ActionButton.PRIMARY, false, (e) => {
            messageBus.emit("UpControler", {})
        })

        // button up event
        input.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, (e) => {
            messageBus.emit("DownControler", {})
        })
        messageBus.on("UpControler", () => {
            this.entity.addComponent(
                new OnPointerUp((e) => {
                    log("Up", e)
                }, {
                    button: ActionButton.PRIMARY
                })
            )
        })
        messageBus.on("DownControler", () => {
            this.entity.addComponent(
                new OnPointerUp((e) => {
                    log("Down", e)
                }, {
                    button: ActionButton.SECONDARY
                })
            )
        })
    }

    update(dt: number) {
        
    }
}