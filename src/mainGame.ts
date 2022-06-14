import TowerDuel from "@/towerDuel";
import * as utils from "@dcl/ecs-scene-utils";
import { GoToPlayAction, CleanTowerDuelAction } from "@/actions/gameApproval";
import { LaunchSoloGameAction, StarterTimerAction } from "@/actions/launchGame";
import { BackToLiftToGamePositionAction, BackToLobbyAction, EndGameResultAction, FinaliseTowerDuelAction } from "@/actions/afterTowerDuel";
import LiftToGame from "@/liftToGame";
import { SelectModeAction } from "./actions/modeSelection";
import Game from "./game";

export default class MainGame implements ISystem {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus

    TowerDuel?: TowerDuel// TowerDuel
    liftToGame: LiftToGame

    isActive: boolean = false
    isActiveSequence: boolean = false
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

    public modeSelection() {
        log('modeSelection')
        !this.isActiveSequence ? this.isActiveSequence = true : false
        this.addSequence('modeSelection')
    }

    public gameApprovalSolo(type: string) {
        log('gameApproval')
        this.isActive = true
        !this.isActiveSequence ? this.isActiveSequence = true : false
        this.addSequence('gameApprovalSolo')
    }

    public gameApprovalMulti() {
        log('gameApproval')
        !this.isActive ? this.isActive = true :
            !this.isActiveSequence ? this.isActiveSequence = true : false
        this.addSequence('gameApprovalMulti')
    }

    public launchGame() {
        log('launchGame')
        !this.isActive ? this.isActive = true :
            !this.isActiveSequence ? this.isActiveSequence = true : false
        this.addSequence('launchGame')
    }

    public afterTowerDuel() {
        log('afterTowerDuel')
        this.isActive ? this.isActive = false : true
        !this.isActiveSequence ? this.isActiveSequence = true : false
        this.addSequence('AfterTowerDuelSequence')
    }

    public stopSequence() {
        this.isActiveSequence = false
        this.gameSequenceSystem?.stop()
        let queue = this.parent.lobbyScreen?.usersInQueue
        if (queue && queue.filter(item => item.public_address === this.parent.user.public_address)) {
            this.parent.messageBus.emit('removeUserInQueue_' + this.parent.user.realm, { user: this.parent.user })
        }
        if (this.gameSequenceSystem) {
            engine.removeSystem(this.gameSequenceSystem)
            this.gameSequenceSystem = undefined
        }
    }

    private addSequence(type: string) {
        switch (type) {
            case "modeSelection": {
                this.gameSequence = new utils.ActionsSequenceSystem.SequenceBuilder()
                    .then(new SelectModeAction(this))
                
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
                    .then(new BackToLiftToGamePositionAction(this.TowerDuel?.lift))
                    .then(new BackToLobbyAction(this.liftToGame))
                    .then(new FinaliseTowerDuelAction(this))
                    .then(new EndGameResultAction(this))
                
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
