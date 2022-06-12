import MainGame from '@/mainGame'
import * as utils from '@dcl/ecs-scene-utils'
import * as ui from '@dcl/ui-scene-utils'

//Use IAction to define action for movement
export class SelectModeAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    prompt: ui.OptionPrompt
    parent: MainGame

    constructor(parent: MainGame) {
        this.parent = parent
        this.prompt = new ui.OptionPrompt(
            'Select your mode !',
            'Would you play solo or versus player ?',
            () => {
                log(`picked option Solo`)
                this.parent.gameApprovalSolo('gameApprovalSolo')
                this.parent.liftToGame.entity.getComponent(AudioSource).playOnce()
                this.hasFinished = true
            },
            () => {
                log(`picked option Multi`)
                this.parent.gameApprovalMulti('gameApprovalMulti')
                this.hasFinished = true
            },
            'Solo',
            'Pvp'
        )
        this.prompt.hide()
    }

    //Method when action starts
    onStart(): void {
        this.prompt.show()
    }

    update(dt: number): void { }

    onFinish(): void {
        log(`this.prompt.hide()`, this.prompt.alive)
        if (this.prompt && this.prompt.alive) this.prompt.hide()
    }
}
