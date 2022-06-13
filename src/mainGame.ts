import TowerDuel from "@/towerDuel";
import * as utils from "@dcl/ecs-scene-utils";
import { GoToPlayAction, CleanTowerDuelAction } from "@/actions/gameApproval";
import { LaunchSoloGameAction } from "@/actions/launchGame";
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
    modeSelectionAction: SelectModeAction

    isActive: boolean = false
    parent: Game;
    side: string

    constructor(cannonMaterial: CANNON.Material, world: CANNON.World, parent: Game, messageBus: MessageBus, side: string) {
        this.physicsMaterial = cannonMaterial
        this.world = world
        this.parent = parent
        this.messageBus = messageBus
        this.side = side
        this.liftToGame = new LiftToGame(this)

        // Actions
        this.modeSelectionAction = new SelectModeAction(this.parent)

        this.Init();
    }

    Init = () => {
        this.BuildEvents()
    };

    private BuildEvents() {
    }

    public modeSelection(type: string) {
        log('modeSelection')
        if (type === 'in') this.addSequence('modeSelection')
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

    private addSequence(type: string) {
        let sequence = null
        switch (type) {
            case "modeSelection": {
                sequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                    .then(this.modeSelectionAction)
                
                break;
            }
            case "gameApprovalSolo": {
                sequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                    .then(new GoToPlayAction(this.liftToGame))
                    .then(new CleanTowerDuelAction(this))

                break;
            }
            case "gameApprovalMulti": {
                // Wait other player
                // Find player
                // Clean scene, move player

                // sequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                //     .then(new GoToPlayAction(this.liftToGame))
                //     .then(new WaitTowerDuelAction(this.messageBus))

                break;
            }
            case "launchGame": {
                sequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                    .then(new LaunchSoloGameAction(this, this.physicsMaterial, this.world))
                
                break;
            }
            case "AfterTowerDuelSequence": {
                sequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                    .then(new BackToLobbyAction(this.liftToGame))
                    .then(new FinaliseTowerDuelAction(this))
                
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
