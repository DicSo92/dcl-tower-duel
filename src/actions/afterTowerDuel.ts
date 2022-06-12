import { ILiftToGame } from '@/interfaces/class.interface'
import MainGame from '@/mainGame'
import { publishScore } from '@/serverHandler'
import * as utils from '@dcl/ecs-scene-utils'

export class BackToLobbyAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    liftToGame: ILiftToGame

    constructor(liftToGame: ILiftToGame) {
        this.liftToGame = liftToGame
    }
    
    onStart(): void {
        log('BackToLobbyAction')
        this.hasFinished = false
        this.liftToGame.lift.getComponent(AudioSource).playing = true
        this.liftToGame.goToLobby()
    }

    update(dt: number): void {
        if (!this.liftToGame.isActive) {
            this.liftToGame.lift.getComponent(AudioSource).playing = false
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
        if (this.parent.parent.user.public_address) {
            this.parent.messageBus.emit('removeUserInGame', {
                user: this.parent.parent.user.public_address
            })
        }
        this.setScore()
        utils.setTimeout(1000, () => {
            if (this.parent.parent.streamSource) this.parent.parent.streamSource.getComponent(AudioStream).playing = true
            this.hasFinished = true
        })
    }

    async setScore() {
        if (this.parent.TowerDuel[0].lift) {
            const result = await publishScore(this.parent.parent.user, parseInt(this.parent.TowerDuel[0].lift.numericalCounter.text.value))
            log('setScore OK', result)
            this.parent.parent.leaderBoard?.updateBoard(result)
        }
    }
    
    update(dt: number): void { }

    onFinish(): void { }
}