import * as utils from "@dcl/ecs-scene-utils";

@Component("playerSelector")
export class PlayerSelectorFlag { }

export default class PlayerSelector implements ISystem {
    entity: Entity
    selector: Entity
    messageBus: MessageBus
    startPath: Vector3[]
    endPath: Vector3[]
    step: number

    constructor(messageBus: MessageBus) {
        this.messageBus = messageBus
        // start : new Vector3(18, 0, 24)
        // end : new Vector3(24, 0, 16)
        this.startPath = [
            new Vector3(18, 0, 24),
            new Vector3(20, 6, 21),
            new Vector3(22, 6, 19),
            new Vector3(24, 6, 16),
            new Vector3(24, 0, 16)
        ]
        this.endPath = [
            new Vector3(24, 0, 16),
            new Vector3(24, 6, 16),
            new Vector3(22, 6, 19),
            new Vector3(20, 6, 21),
            new Vector3(18, 0, 24),
        ]
        this.step = this.startPath.length
        this.entity = new Entity()
        this.entity.addComponent(new PlayerSelectorFlag())
        this.entity.addComponent(new Transform({
            position: new Vector3(18, 0, 24),
            scale: new Vector3(1, 1, 1)
        }))
        engine.addEntity(this.entity)

        this.selector = new Entity()
        this.selector.setParent(this.entity)
        this.selector.addComponent(new Transform({
            position: new Vector3(0, 0, 0),
            scale: new Vector3(1,0.02,1)
        }))
        this.selector.addComponent(new CylinderShape())

        const btn = new Entity()
        btn.addComponent(new Transform({
            scale: new Vector3(.2, .2, .2)
        }))
        btn.setParent(this.entity)
        btn.addComponent(new BoxShape())
        btn.getComponent(Transform).position.y = 1
        btn.addComponent(new OnPointerDown(() => {
            this.messageBus.emit("BeforeTowerDuelSequence", {
                test: "text test"
            })
        }))
    }

    goToPlay() {
        this.entity.addComponent(new utils.FollowPathComponent(this.startPath, this.step, () => {
            return
        }))
    }

    goToLobby() {
        this.entity.addComponent(new utils.FollowPathComponent(this.endPath, this.step))
    }

    update() {
        
    }
}