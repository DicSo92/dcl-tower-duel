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
        if (this.parent.parent.prompt) {
            log("Prompt exist")
            this.parent.parent.prompt.title.value = 'Confirmation !'
            this.parent.parent.prompt.text.value = 'Would you start to play ?'
            this.parent.parent.prompt.onAccept = () => {
                this.parent.parent.messageBus.emit('confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address, { result: true, side: this.parent.side })
                this.parent.parent.prompt?.hide()
                this.hasFinished = true
            }
            this.parent.parent.prompt.onReject = () => {
                this.parent.parent.messageBus.emit('confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address, { result: false, side: this.parent.side })
                this.parent.parent.prompt?.hide()
                this.hasFinished = true
            }
            this.parent.parent.prompt.buttonELabel.value = 'Yes'
            this.parent.parent.prompt.buttonFLabel.value = 'No'
            this.parent.parent.prompt.show()
            this.parent.parent.prompt.closeIcon.height = 0
            this.parent.parent.prompt.closeIcon.width = 0
        } else {
            log("New prompt")
            this.parent.parent.prompt = new ui.OptionPrompt(
                'Confirmation !',
                'Would you start to play ?',
                () => {
                    log(`Yes`)
                    this.parent.parent.messageBus.emit('confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address, { result: true, side: this.parent.side })
                    this.parent.parent.prompt?.hide()
                    this.hasFinished = true
                },
                () => {
                    log(`No`)
                    this.parent.parent.messageBus.emit('confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address, { result: false, side: this.parent.side })
                    this.parent.parent.prompt?.hide()
                    this.hasFinished = true
                },
                'Yes',
                'No',
                true
            )
            this.parent.parent.prompt.closeIcon.height = 0
            this.parent.parent.prompt.closeIcon.width = 0
        }
    }

    update(dt: number): void { }

    onFinish(): void { }
}
