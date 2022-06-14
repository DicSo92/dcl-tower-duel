import Game from '@/game'
import MainGame from '@/mainGame'
import * as utils from '@dcl/ecs-scene-utils'
import * as ui from '@dcl/ui-scene-utils'
import { movePlayerTo } from '@decentraland/RestrictedActions'

//Use IAction to define action for movement
export class SelectModeAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame

    constructor(parent: MainGame) {
        this.parent = parent
    }

    //Method when action starts
    onStart(): void {
        log("startSelectModeAction")
        log("SelectModeAction.")
        if (this.parent.parent.prompt) {
            this.parent.parent.prompt.title.value = 'Confirmation !'
            this.parent.parent.prompt.text.value = 'Would you start to play ?'
            this.parent.parent.prompt.onAccept = () => {
                log(`Yes`, 'confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address)
                this.parent.parent.lobbyScreen?.removeUserInQueue(this.parent.parent.user)
                this.parent.parent.messageBus.emit('confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address, { result: true, side: this.parent.side })
                this.parent.parent.prompt?.hide()
                this.hasFinished = true
            }
            this.parent.parent.prompt.onReject = () => {
                log(`No`)
                this.parent.parent.lobbyScreen?.removeUserInQueue(this.parent.parent.user)
                this.parent.parent.messageBus.emit('confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address, { result: false, side: this.parent.side })

                this.hasFinished = true
            }
            this.parent.parent.prompt.buttonELabel.value = 'Yes'
            this.parent.parent.prompt.buttonFLabel.value = 'No'
        }
        this.parent.parent.prompt = new ui.OptionPrompt(
            'Confirmation !',
            'Would you start to play ?',
            () => {
                log(`Yes`, 'confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address)
                this.parent.parent.lobbyScreen?.removeUserInQueue(this.parent.parent.user)
                this.parent.parent.messageBus.emit('confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address, { result: true, side: this.parent.side })
                this.parent.parent.prompt?.hide()
                this.hasFinished = true
            },
            () => {
                log(`No`)
                this.parent.parent.lobbyScreen?.removeUserInQueue(this.parent.parent.user)
                this.parent.parent.messageBus.emit('confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address, { result: false, side: this.parent.side })

                this.hasFinished = true
            },
            'Yes',
            'No',
            true
        )
    }

    update(dt: number): void { }

    onFinish(): void { this.parent.parent.prompt?.hide() }
}
