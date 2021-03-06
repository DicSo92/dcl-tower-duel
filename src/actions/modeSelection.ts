import MainGame from '@/mainGame'
import {ActionsSequenceSystem, ToggleComponent} from '@dcl/ecs-scene-utils'
import { OptionPrompt } from '@dcl/ui-scene-utils'

//Use IAction to define action for movement
export class SelectModeAction implements ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame
    prompt?: OptionPrompt

    constructor(parent: MainGame) {
        this.parent = parent
        this.prompt = this.parent.parent.prompt
    }

    //Method when action starts
    onStart(): void {
        log("startSelectModeAction")
        if (this.prompt) {
            log("Prompt exist")
            this.prompt.title.value = 'Confirmation !'
            this.prompt.text.value = 'Would you start to play ?'
            this.prompt.onAccept = () => {
                this.parent.parent.messageBus.emit('confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address, { result: true, side: this.parent.side })
                this.prompt?.hide()
                this.hasFinished = true
            }
            this.prompt.onReject = () => {
                this.parent.parent.messageBus.emit('confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address, { result: false, side: this.parent.side })
                this.prompt?.hide()
                this.hasFinished = true
            }
            this.prompt.buttonELabel.value = 'Yes'
            this.prompt.buttonFLabel.value = 'No'
            this.prompt.closeIcon.height = 0
            this.prompt.closeIcon.width = 0
            this.prompt.show()
        } else {
            log("New prompt")
            this.prompt = new OptionPrompt(
                'Confirmation !',
                'Would you start to play ?',
                () => {
                    log(`Yes`)
                    this.parent.parent.messageBus.emit('confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address, { result: true, side: this.parent.side })
                    this.prompt?.hide()
                    this.hasFinished = true
                },
                () => {
                    log(`No`)
                    this.parent.parent.messageBus.emit('confirmationNewGame_' + this.parent.parent.user.realm + '_' + this.parent.parent.user.public_address, { result: false, side: this.parent.side })
                    this.prompt?.hide()
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

    update(dt: number): void { }

    onFinish(): void {
        if (this.parent.parent.lobbyScreen?.container.getComponent(ToggleComponent).isOn()) {
            this.parent.parent.lobbyScreen?.container.getComponent(ToggleComponent).toggle()
        }
    }
}
