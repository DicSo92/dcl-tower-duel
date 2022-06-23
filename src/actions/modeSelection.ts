import Game from '@/game'
import { ActionsSequenceSystem, ToggleComponent } from '@dcl/ecs-scene-utils'
import { OptionPrompt } from '@dcl/ui-scene-utils'

export class SelectModeAction implements ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: Game
    prompt?: OptionPrompt

    constructor(parent: Game) {
        this.parent = parent
        this.prompt = this.parent.prompt
    }

    onStart(): void {
        log("startSelectModeAction")
        if (this.prompt) {
            log("Prompt exist")
            this.prompt.title.value = 'Confirmation !'
            this.prompt.text.value = 'Would you start to play ?'
            this.prompt.onAccept = () => {
                const data = { user: this.parent.userConnection?.getUserData(), result: true }
                this.parent.userConnection?.socket?.send(JSON.stringify({ event: 'userConfirmGame', data: data }))
                this.prompt?.hide()
                this.hasFinished = true
            }
            this.prompt.onReject = () => {
                const data = { user: this.parent.userConnection?.getUserData(), result: true }
                this.parent.userConnection?.socket?.send(JSON.stringify({ event: 'userConfirmGame', data: data }))
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
                    const data = { user: this.parent.userConnection?.getUserData(), result: true }
                    this.parent.userConnection?.socket?.send(JSON.stringify({ event: 'userConfirmGame', data: data }))
                    this.prompt?.hide()
                    this.hasFinished = true
                },
                () => {
                    log(`No`)
                    const data = { user: this.parent.userConnection?.getUserData(), result: false }
                    this.parent.userConnection?.socket?.send(JSON.stringify({ event: 'userConfirmGame', data: data }))
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
        if (this.parent.selectionSequenceSystem) {
            engine.removeSystem(this.parent.selectionSequenceSystem)
            this.parent.selectionSequenceSystem = undefined
        }
        if (this.parent.lobbyScreen?.container.getComponent(ToggleComponent).isOn()) {
            this.parent.lobbyScreen?.container.getComponent(ToggleComponent).toggle()
        }
    }
}
