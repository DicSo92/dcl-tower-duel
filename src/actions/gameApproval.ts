import LiftToGame from '@/liftToGame'
import MainGame from '@/mainGame'
import { ActionsSequenceSystem, setTimeout } from '@dcl/ecs-scene-utils'

export class CleanTowerDuelAction implements ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame

    constructor(parent: MainGame) {
        this.parent = parent
    }

    onStart(): void {
        this.hasFinished = false

        this.parent.TowerDuel?.CleanEntities()
        if (this.parent.TowerDuel?.lift) this.parent.TowerDuel?.lift?.Delete()
        if (this.parent.TowerDuel) {
            engine.removeSystem(this.parent.TowerDuel)
            this.parent.TowerDuel = undefined
        }
        this.hasFinished = true
    }
    update(dt: number): void { }
    onFinish(): void {
        this.parent.launchGame()
    }
}

export class GoToPlayAction implements ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    liftToGame: LiftToGame

    constructor(liftToGame: LiftToGame) {
        this.liftToGame = liftToGame
    }

    onStart(): void {
        this.hasFinished = false
        this.liftToGame.lift.getComponent(AudioSource).audioClip.loop = true
        this.liftToGame.lift.getComponent(AudioSource).playing = true
        setTimeout(1000, () => {
            this.liftToGame.goToPlay(this)
        })
    }
    update(dt: number): void { }
    onFinish(): void {  }
}