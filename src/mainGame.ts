import { IMainGame, ITowerDuel } from "@/interfaces/class.interface";
import * as utils from "@dcl/ecs-scene-utils";
import { GoToPlayAction, WaitTowerDuelAction } from "@/actions/gameApproval";
import { LaunchGameAction } from "@/actions/launchGame";
import { BackToLobbyAction, FinaliseTowerDuelAction } from "@/actions/afterTowerDuel";
import PlayerSelector from "@/playerSelector";
import { SelectModeAction } from "./actions/modeSelection";

export default class MainGame implements ISystem, IMainGame {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus
    TowerDuel: ITowerDuel[] = [] // ITowerDuel
    liftToGame: PlayerSelector
    isActive: boolean = false

    constructor(cannonMaterial: CANNON.Material, world: CANNON.World, messageBus: MessageBus) {
        this.physicsMaterial = cannonMaterial
        this.world = world
        this.messageBus = messageBus
        this.liftToGame = new PlayerSelector(this, this.messageBus)

        this.Init();
    }

    Init = () => {
        this.BuildEvents()
    };

    private BuildEvents() {
        this.messageBus.on('modeSelection', (test) => { // onModeSelection
            log('modeSelection')
            this.addSequence('modeSelection')
        })
        this.messageBus.on("gameApproval", (test) => { // onGameApprove
            log('gameApproval')
            this.isActive = true
            this.addSequence('gameApproval')
        })
        this.messageBus.on("launchGame", (test) => { // onLaunchGame
            log('launchGame')
            this.addSequence('launchGame')
        })
        this.messageBus.on("AfterTowerDuelSequence", (test) => { // onAfterTowerDuelSequence
            log('AfterTowerDuelSequence')
            this.addSequence('AfterTowerDuelSequence')
        })
    }

    private addSequence(type: string) {
        let sequence = null
        switch (type) {
            case "modeSelection": {
                sequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                    .then(new SelectModeAction(this.messageBus))
                
                break;
            }
            case "gameApproval": {
                sequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                    .then(new GoToPlayAction(this.liftToGame))
                    .then(new WaitTowerDuelAction(this.messageBus))
                
                break;
            }
            case "launchGame": {
                sequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                    .then(new LaunchGameAction(this, this.physicsMaterial, this.world, this.messageBus))
                
                break;
            }
            case "AfterTowerDuelSequence": {
                sequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                    .then(new BackToLobbyAction(this.liftToGame))
                    // .then(new FinaliseTowerDuelAction(this))
                
                break;
            }
        }
        if (sequence) {
            const system = new utils.ActionsSequenceSystem(sequence)
            // actionSystem.setOnFinishCallback(() => { })
            engine.addSystem(system) 
        }
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
