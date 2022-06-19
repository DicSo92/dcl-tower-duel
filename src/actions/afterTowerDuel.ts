import Lift from '@/lift'
import LiftToGame from '@/liftToGame'
import MainGame from '@/mainGame'
import { publishScore } from '@/serverHandler'
import { ActionsSequenceSystem, setTimeout } from '@dcl/ecs-scene-utils'
import { OptionPrompt } from '@dcl/ui-scene-utils'

export class BackToLiftToGamePositionAction implements ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    lift?: Lift

    constructor(lift?: Lift) {
        this.lift = lift
    }

    onStart(): void {
        this.lift?.reset(this)
    }

    update(dt: number): void {
    }

    onFinish(): void { }
}

export class BackToLobbyAction implements ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    liftToGame: LiftToGame

    constructor(liftToGame: LiftToGame) {
        this.liftToGame = liftToGame
    }

    onStart(): void {
        this.hasFinished = false
        this.liftToGame.lift.getComponent(AudioSource).playing = true

        this.liftToGame.goToLobby(this)
    }

    update(dt: number): void {
    }

    onFinish(): void { }
}

export class FinaliseTowerDuelAction implements ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame

    constructor(parent: MainGame) {
        this.parent = parent
    }

    onStart(): void {
        this.parent.isActive = false
        this.setScore().then(() => {
            if (this.parent.parent.userConnection?.userData.public_address) {
                const data = { user: this.parent.parent.userConnection.getUserData() }
                this.parent.parent.userConnection?.socket?.send(JSON.stringify({ event: 'endGame', data: data }))
            }
            this.parent.TowerDuel?.lift?.reset(this)
            this.hasFinished = true
        })
    }

    async setScore() {
        if (this.parent.TowerDuel?.lift) {
            if (this.parent.parent.userConnection) {
                const result = await publishScore(this.parent.parent.userConnection?.getUserData(), parseInt(this.parent.TowerDuel?.lift.numericalCounter.text.value))
                this.parent.parent.leaderBoard?.updateBoard(result)
            }
        }
    }

    update(dt: number): void { }

    onFinish(): void { }
}

export class EndGameResultAction implements ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame
    counter: number = 5
    prompt?: OptionPrompt

    constructor(parent: MainGame) {
        this.parent = parent
        this.prompt = this.parent.parent.prompt
    }

    onStart(): void {
        if (this.parent.TowerDuel?.lift?.numericalCounter.text.value) {
            if (this.prompt) {
                this.prompt.title.value = "Result"
                this.prompt.text.value = `Your score : ${this.parent.TowerDuel?.lift.numericalCounter.text.value} blocks\nDo you want to play again ?`
                this.prompt.onAccept = () => {
                    this.parent.parent.messageBus.emit('addUserInQueue_' + this.parent.parent.userConnection?.userData.realm, { user: this.parent.parent.userConnection?.userData })
                    this.prompt?.hide()
                    this.hasFinished = true
                }
                this.prompt.onReject = () => {
                    this.prompt?.hide()
                    this.hasFinished = true
                }
                this.prompt.buttonELabel.value = 'Yes'
                this.prompt.buttonFLabel.value = 'No'
                this.prompt.closeIcon.height = 0
                this.prompt.closeIcon.width = 0
                this.prompt.show()
            } else {
                this.prompt = new OptionPrompt(
                    'Result',
                    `Your score : ${this.parent.TowerDuel?.lift.numericalCounter.text.value} blocks\nDo you want to play again ?`,
                    () => {
                        const data = { user: this.parent.parent.userConnection?.getUserData() }
                        this.parent.parent.userConnection?.socket?.send(JSON.stringify({ event: 'userClickToPlay', data: data }))
                        this.parent.parent.prompt?.hide()
                        this.hasFinished = true
                    },
                    () => {
                        this.parent.parent.prompt?.hide()
                        this.hasFinished = true
                    },
                    'Yes',
                    'No',
                    true
                )
                this.prompt.closeIcon.height = 0
                this.prompt.closeIcon.width = 0
            }
        }
    }

    onFinish(): void { }

    update(dt: number): void {
    }
}
