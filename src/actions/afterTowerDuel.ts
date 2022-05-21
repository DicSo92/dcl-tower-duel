import { ITowerDuel } from '@/interfaces/class.interface'
import MainGame from '@/mainGame'
import PlayerSelector from '@/playerSelector'
import TowerDuel from '@/towerDuel'
import * as utils from '@dcl/ecs-scene-utils'

//Use IAction to define action for movement
export class BackToLobbyAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    playerSelector: PlayerSelector
    constructor(playerSelector: PlayerSelector) {
        this.playerSelector = playerSelector
    }

    //Method when action starts
    onStart(): void {
        this.hasFinished = false
        this.playerSelector.goToLobby()
    }
    //Method to run on every frame
    update(dt: number): void {
        if (!this.playerSelector.isActive) {
            this.hasFinished = true
        }
     }
    //Method to run at the end
    onFinish(): void {
    }
}

//Use IAction to define action for movement
export class FinaliseTowerDuelAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame

    constructor(parent: MainGame) {
        this.parent = parent
    }

    //Method when action starts
    onStart(): void {
        this.parent.isActive = false
        this.parent.TowerDuel.forEach((item: ITowerDuel) => {
            item.CleanEntities()
        })
        this.hasFinished = true
    }
    //Method to run on every frame
    update(dt: number): void { }
    //Method to run at the end
    onFinish(): void {
    }
}