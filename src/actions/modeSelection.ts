import Game from '@/game'
import MainGame from '@/mainGame'
import * as utils from '@dcl/ecs-scene-utils'
import * as ui from '@dcl/ui-scene-utils'

//Use IAction to define action for movement
export class SelectModeAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    prompt?: ui.OptionPrompt
    parent: MainGame

    constructor(parent: MainGame) {
        this.parent = parent
        log("SelectModeAction.")
        if (this.parent.side === "left") {
            this.prompt = new ui.OptionPrompt(
                'Select your mode !',
                'Would you play ?',
                () => {
                    log(`Yes`)
                    this.parent.gameApprovalSolo('gameApprovalSolo')
                    this.parent.liftToGame.entity.getComponent(AudioSource).playOnce()
                    this.hasFinished = true
                },
                () => {
                    log(`No`)
                    this.prompt?.hide()
                    this.hasFinished = true
                },
                'Yes',
                'No'
            )
            this.prompt?.hide()
        } else if (this.parent.side === "right") {
            this.prompt = new ui.OptionPrompt(
                'Select your mode !',
                'Would you play ?',
                () => {
                    log(`Yes`)
                    this.parent.gameApprovalSolo('gameApprovalSolo')
                    this.parent.liftToGame.entity.getComponent(AudioSource).playOnce()
                    this.hasFinished = true
                },
                () => {
                    log(`No`)
                    this.prompt?.hide()
                    this.hasFinished = true
                },
                'Yes',
                'No'
            )
            this.prompt.hide()
        }
    }

    //Method when action starts
    onStart(): void {
        this.prompt?.show()
    }

    update(dt: number): void { }

    onFinish(): void {
        log(`this.prompt.hide()`, this.prompt?.alive)
        if (this.prompt && this.prompt.alive) this.prompt.hide()
    }
}
