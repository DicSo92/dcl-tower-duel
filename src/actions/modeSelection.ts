import * as utils from '@dcl/ecs-scene-utils'
import * as ui from '@dcl/ui-scene-utils'

//Use IAction to define action for movement
export class SelectModeAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    messageBus: MessageBus
    prompt?: ui.OptionPrompt

    constructor(messageBus: MessageBus) {
        this.messageBus = messageBus
    }

    //Method when action starts
    onStart(): void {
        this.prompt = new ui.OptionPrompt(
            'Select your mode !',
            'Would you play solo or versus player ?',
            () => {
                log(`picked option Solo`)
                this.messageBus.emit("gameApproval", {
                    test: "gameApproval.solo"
                })
                this.hasFinished = true
            },
            () => {
                log(`picked option B`)
                this.messageBus.emit("gameApproval", {
                    test: "gameApproval.pvp"
                })
                this.hasFinished = true
            },
            'Solo',
            'Pvp'
        )
    }
    
    update(dt: number): void { }
    
    onFinish(): void {
        log(`this.prompt.hide()`)
        if(this.prompt) this.prompt.hide()
    }
}
