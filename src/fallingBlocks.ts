export default class FallingBlocks implements ISystem {
    messageBus: MessageBus

    constructor(messageBus: MessageBus) {
        this.messageBus = messageBus
        this.Init()
    }
    Init = () => {

    }

    update(dt: number) {
        // log("Update", dt)
    }
}
