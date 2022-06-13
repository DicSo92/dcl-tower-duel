import TowerDuel from "@/towerDuel";
import * as utils from "@dcl/ecs-scene-utils";
import { GoToPlayAction, CleanTowerDuelAction } from "@/actions/gameApproval";
import { LaunchSoloGameAction, StarterTimerAction } from "@/actions/launchGame";
import { BackToLobbyAction, FinaliseTowerDuelAction } from "@/actions/afterTowerDuel";
import LiftToGame from "@/liftToGame";
import { SelectModeAction } from "./actions/modeSelection";
import Game from "./game";

export default class MainGame implements ISystem {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus

    TowerDuel?: TowerDuel// TowerDuel
    liftToGame: LiftToGame
    modeSelectionAction?: SelectModeAction

    isActive: boolean = false
    parent: Game;
    side: string
    gameSequence?: utils.ActionsSequenceSystem.SequenceBuilder;
    gameSequenceSystem?: utils.ActionsSequenceSystem;

    constructor(cannonMaterial: CANNON.Material, world: CANNON.World, parent: Game, messageBus: MessageBus, side: string) {
        this.physicsMaterial = cannonMaterial
        this.world = world
        this.parent = parent
        this.messageBus = messageBus
        this.side = side
        this.liftToGame = new LiftToGame(this)

        // Actions

        this.Init();
    }

    Init = () => {
        this.BuildEvents()
    };

    private BuildEvents() {
    }

    public modeSelection(type: string) {
        log('modeSelection')
        this.addSequence('modeSelection')
        // else this.modeSelectionAction?.prompt?.hide()
    }

    public gameApprovalSolo(type: string) {
        log('gameApproval')
        this.isActive = true
        this.addSequence('gameApprovalSolo')
    }

    public gameApprovalMulti(type: string) {
        log('gameApproval')
        this.isActive = true
        this.addSequence('gameApprovalMulti')
    }

    public launchGame() {
        log('launchGame')
        this.addSequence('launchGame')
    }

    public afterTowerDuel() {
        log('afterTowerDuel')
        this.addSequence('AfterTowerDuelSequence')
    }

    public stopSequence() {
        this.gameSequenceSystem?.stop()
        if (this.gameSequenceSystem) {
            engine.removeSystem(this.gameSequenceSystem)
            this.gameSequenceSystem = undefined
        }
    }

    private addSequence(type: string) {
        switch (type) {
            case "modeSelection": {
                this.gameSequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                    .then(this.modeSelectionAction = new SelectModeAction(this))
                
                break;
            }
            case "gameApprovalSolo": {
                this.gameSequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                    .then(new GoToPlayAction(this.liftToGame))
                    .then(new CleanTowerDuelAction(this))

                break;
            }
            case "launchGame": {
                this.gameSequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                    .then(new LaunchSoloGameAction(this, this.physicsMaterial, this.world))
                    .then(new StarterTimerAction(this, this.physicsMaterial, this.world))
                
                break;
            }
            case "AfterTowerDuelSequence": {
                this.gameSequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                    .then(new BackToLobbyAction(this.liftToGame))
                    .then(new FinaliseTowerDuelAction(this))
                
                break;
            }
        }
        if (this.gameSequence) {
            this.gameSequenceSystem = new utils.ActionsSequenceSystem(this.gameSequence)
            // actionSystem.setOnFinishCallback(() => { })
            engine.addSystem(this.gameSequenceSystem) 
        }
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
