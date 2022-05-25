import { ITowerDuel } from '@/interfaces/class.interface'
import MainGame from '@/mainGame'
import LiftToGame from '@/liftToGame'
import TowerDuel from '@/towerDuel'
import * as utils from '@dcl/ecs-scene-utils'

export class BackToLobbyAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    liftToGame: LiftToGame

    constructor(liftToGame: LiftToGame) {
        this.liftToGame = liftToGame
    }
    
    onStart(): void {
        log('BackToLobbyAction')
        this.hasFinished = false
        this.liftToGame.goToLobby()
    }

    update(dt: number): void {
        if (!this.liftToGame.isActive) {
            this.hasFinished = true
        }
    }
    
    onFinish(): void { }
}

export class FinaliseTowerDuelAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame

    constructor(parent: MainGame) {
        this.parent = parent
    }
    
    onStart(): void {
        log('FinaliseTowerDuelAction')
        this.parent.isActive = false
        this.parent.TowerDuel[0].lift?.reset()
        if (this.parent.parent.userId) {
            this.parent.messageBus.emit('removeUserInGame', {
                user: this.parent.parent.userId
            })
        }
        utils.setTimeout(1000, () => {
            this.hasFinished = true
        })
    }
    
    update(dt: number): void { }
    
    onFinish(): void { }
}