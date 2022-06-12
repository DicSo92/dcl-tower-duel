import LobbyScreen from "@/lobbyScreen";

export default class LobbyScreenBorder extends Entity {
    LobbyScreen: LobbyScreen
    messageBus: MessageBus

    borderModel : GLTFShape
    ringsModel : GLTFShape

    rings: Entity

    constructor(lobbyScreen: LobbyScreen, messageBus: MessageBus, position: Vector3, rotation: Vector3) {
        super()
        this.LobbyScreen = lobbyScreen
        this.messageBus = messageBus

        this.borderModel = new GLTFShape('models/LobbyScreenAngle.glb')
        this.ringsModel = new GLTFShape('models/Rings.glb')

        this.addComponent(this.borderModel)
        this.addComponent(new Transform({ position: position }))
        this.getComponent(Transform).rotation.eulerAngles = rotation
        this.setParent(this.LobbyScreen.container)

        this.rings = new Entity()
        this.rings.addComponent(this.ringsModel)
        this.rings.addComponent(new Transform({ position: new Vector3(0, 0.01, 0) }))
        this.rings.setParent(this)

        this.Init()
    }
    Init = () => {

    }
}
