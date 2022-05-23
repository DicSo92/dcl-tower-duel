import liftToGame from '@/liftToGame'
import * as utils from '@dcl/ecs-scene-utils'
import * as ui from '@dcl/ui-scene-utils'

//Use IAction to define action for movement
export class WaitTowerDuelAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    messageBus: MessageBus

    constructor(messageBus: MessageBus) {
        this.messageBus = messageBus
    }

    //Method when action starts
    onStart(): void {
        this.hasFinished = false
        utils.setTimeout(5000, () => {
            this.hasFinished = true
            this.messageBus.emit("launchGame", {
                test: "text test"
            })
        })
    }
    //Method to run on every frame
    update(dt: number): void { }
    //Method to run at the end
    onFinish(): void { }
}

//Use IAction to define action for movement
export class GoToPlayAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    liftToGame: liftToGame

    constructor(liftToGame: liftToGame) {
        this.liftToGame = liftToGame
    }

    //Method when action starts
    onStart(): void {
        this.hasFinished = false
        this.liftToGame.goToPlay()

        utils.setTimeout(100, () => {
            this.hasFinished = true
        })
    }
    //Method to run on every frame
    update(dt: number): void { }
    //Method to run at the end
    onFinish(): void {
    }
}