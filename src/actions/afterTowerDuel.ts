import PlayerSelector from '@/playerSelector'
import * as utils from '@dcl/ecs-scene-utils'

//Use IAction to define action for movement
export class BackToLobbyAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    playerSelector: PlayerSelector
    constructor(playerSelector: PlayerSelector) {
        this.playerSelector = playerSelector
    }

    //Method when action starts
    onStart(): void {
        this.hasFinished = false
        this.playerSelector.goToLobby()
        this.hasFinished = true
    }
    //Method to run on every frame
    update(dt: number): void { }
    //Method to run at the end
    onFinish(): void {
        utils.setTimeout(5000, () => {
        })
    }
}