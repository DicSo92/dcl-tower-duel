import { IMainGame, ITowerDuel } from "@/interfaces/class.interface";
import * as utils from "@dcl/ecs-scene-utils";
import { GoToPlayAction, WaitTowerDuelAction } from "@/actions/beforeTowerDuel";
import { LaunchGameAction } from "@/actions/towerDuel";
import { BackToLobbyAction } from "@/actions/afterTowerDuel";
import PlayerSelector from "@/playerSelector";

export default class MainGame implements ISystem, IMainGame {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus

    TowerDuel?: ITowerDuel // ITowerDuel[]
    liftToGame: PlayerSelector

    constructor(cannonMaterial: CANNON.Material, world: CANNON.World, messageBus: MessageBus) {
        this.physicsMaterial = cannonMaterial
        this.world = world
        this.messageBus = messageBus
        this.liftToGame = new PlayerSelector(this.messageBus)

        this.Init();
    }

    Init = () => {
        this.BuildEvents()
    };

    private BuildEvents() {
        this.messageBus.on("gameApproval", () => { // onGameApprove
            log('gameApproval')
            const beforeTowerDuelSequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                .then(new GoToPlayAction(this.liftToGame))
                .then(new WaitTowerDuelAction(this.messageBus))

            const beforeTowerDuelSystem = new utils.ActionsSequenceSystem(beforeTowerDuelSequence)
            // actionSystem.setOnFinishCallback(() => { })
            engine.addSystem(beforeTowerDuelSystem)
        })
        this.messageBus.on("launchGame", () => {
            log('launchGame')

            const towerDuelSequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                .then(new LaunchGameAction(this.physicsMaterial, this.world, this.messageBus))
            const towerDuelSystem = new utils.ActionsSequenceSystem(towerDuelSequence)
            // actionSystem.setOnFinishCallback(() => { })
            engine.addSystem(towerDuelSystem)
        })
        this.messageBus.on("AfterTowerDuelSequence", () => {
            log('AfterTowerDuelSequence')

            const afterTowerDuelSequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                .then(new BackToLobbyAction(this.liftToGame))
            const aftertowerDuelSystem = new utils.ActionsSequenceSystem(afterTowerDuelSequence)
            // actionSystem.setOnFinishCallback(() => { })
            engine.addSystem(aftertowerDuelSystem)
        })
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
