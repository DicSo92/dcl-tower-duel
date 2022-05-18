import TowerBlock from "@/towerBlock";
import GreenButton from "@/greenButton";
import { ITowerDuel } from "@/interfaces/class.interface";

export default class TowerDuel implements ISystem, ITowerDuel {
    messageBus: MessageBus
    blockCount: number

    constructor(messageBus: MessageBus) {
        this.messageBus = messageBus
        this.blockCount = 0
        this.Init();
    }

    private Init = () => {
        this.BuildGreenButton()
        this.BuildEvents()
        const towerBlock = new TowerBlock(this,true);
        engine.addSystem(towerBlock);
    };

    private BuildGreenButton() {
        const greenButton = new GreenButton(new Transform({
            position: new Vector3(4, 1.1, 3),
            rotation: new Quaternion(0, 0, 0, 1),
            scale: new Vector3(2, 2, 2)
        }), this.messageBus);
        engine.addSystem(greenButton);
    }

    private BuildEvents() {
        this.messageBus.on("greenButtonClick", (test) => {
            log('spawn block')

            const spawningBlock = new TowerBlock(this, false);
            engine.addSystem(spawningBlock);
        })
    }

    public update(dt: number) {
        // log("Update", dt)
    }
}

