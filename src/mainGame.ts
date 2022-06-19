import TowerDuel from "@/towerDuel";
import { ActionsSequenceSystem } from "@dcl/ecs-scene-utils";
import { GoToPlayAction, CleanTowerDuelAction } from "@/actions/gameApproval";
import { LaunchSoloGameAction, StarterTimerAction } from "@/actions/launchGame";
import { BackToLiftToGamePositionAction, BackToLobbyAction, EndGameResultAction, FinaliseTowerDuelAction } from "@/actions/afterTowerDuel";
import LiftToGame from "@/liftToGame";
import { SelectModeAction } from "./actions/modeSelection";
import Game from "./game";

export default class MainGame implements ISystem {
    physicsMaterial: CANNON.Material
    world: CANNON.World

    TowerDuel?: TowerDuel// TowerDuel
    liftToGame: LiftToGame

    isActive: boolean = false
    isActiveSequence: boolean = false
    parent: Game;
    side: string
    gameSequence?: ActionsSequenceSystem.SequenceBuilder;
    gameSequenceSystem?: ActionsSequenceSystem;

    constructor(cannonMaterial: CANNON.Material, world: CANNON.World, parent: Game, side: string) {
        this.physicsMaterial = cannonMaterial
        this.world = world
        this.parent = parent
        this.side = side
        this.liftToGame = new LiftToGame(this)

        this.Init();
    }

    Init = () => {
        this.BuildEvents()
    };

    private BuildEvents() {
    }

    public gameApprovalSolo() {
        this.addSequence('gameApprovalSolo')
    }

    public gameApprovalMulti() {
        this.isActive = true
        this.isActiveSequence = true

        this.addSequence('gameApprovalMulti')
    }

    public launchGame() {
        this.isActive = true
        this.isActiveSequence = true
        this.addSequence('launchGame')
    }

    public afterTowerDuel() {
        this.isActive = false
        this.isActiveSequence = false

        this.addSequence('AfterTowerDuelSequence')
    }

    public stopSequence() {
        this.isActive = false // to check
        this.isActiveSequence = false
        this.gameSequenceSystem?.stop()
        if (this.gameSequenceSystem) {
            engine.removeSystem(this.gameSequenceSystem)
            this.gameSequenceSystem = undefined
        }
    }

    private addSequence(type: string) {
        switch (type) {
            case "gameApprovalSolo": {
                this.gameSequence = new ActionsSequenceSystem.SequenceBuilder()
                    .then(new GoToPlayAction(this.liftToGame))
                    .then(new CleanTowerDuelAction(this))
                break;
            }
            case "launchGame": {
                this.gameSequence = new ActionsSequenceSystem.SequenceBuilder()
                    .then(new LaunchSoloGameAction(this, this.physicsMaterial, this.world))
                    .then(new StarterTimerAction(this, this.physicsMaterial, this.world))
                break;
            }
            case "AfterTowerDuelSequence": {
                this.gameSequence = new ActionsSequenceSystem.SequenceBuilder()
                    .then(new BackToLiftToGamePositionAction(this.TowerDuel?.lift))
                    .then(new BackToLobbyAction(this.liftToGame))
                    .then(new FinaliseTowerDuelAction(this))
                    .then(new EndGameResultAction(this))
                break;
            }
        }
        if (this.gameSequence) {
            this.gameSequenceSystem = new ActionsSequenceSystem(this.gameSequence)
            engine.addSystem(this.gameSequenceSystem)
        }
    }

    update(dt: number) { }
}
