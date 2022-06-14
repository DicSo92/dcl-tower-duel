import Game from '@/game'
import MainGame from '@/mainGame'
import * as utils from '@dcl/ecs-scene-utils'
import * as ui from '@dcl/ui-scene-utils'
import { movePlayerTo } from '@decentraland/RestrictedActions'

//Use IAction to define action for movement
export class SelectModeAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    prompt?: ui.OptionPrompt
    parent: MainGame

    constructor(parent: MainGame) {
        this.parent = parent
    }

    //Method when action starts
    onStart(): void {
        log("startSelectModeAction")
        log("SelectModeAction.")
        this.prompt = new ui.OptionPrompt(
            'Confirmation !',
            'Would you start to play ?',
            () => {
                log(`Yes`, 'confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address)
                this.parent.parent.lobbyScreen?.removeUserInQueue(this.parent.parent.user)
                this.parent.parent.messageBus.emit('confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address, { result: true, side: this.parent.side })
                this.prompt?.hide()
                this.hasFinished = true
            },
            () => {
                log(`No`)
                this.parent.parent.lobbyScreen?.removeUserInQueue(this.parent.parent.user)
                this.parent.parent.messageBus.emit('confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address, { result: false, side: this.parent.side })
                
                this.hasFinished = true
            },
            'Yes',
            'No'
        )
    }

    update(dt: number): void { }

    onFinish(): void { this.prompt?.hide() }
}
