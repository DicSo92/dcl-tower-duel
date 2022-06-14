// import { , ITowerDuel } from '@/interfaces/class.interface'
import LiftToGame from '@/liftToGame'
import MainGame from '@/mainGame'
import * as utils from '@dcl/ecs-scene-utils'

//Use IAction to define action for movement
export class CleanTowerDuelAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame

    constructor(parent: MainGame) {
        this.parent = parent
    }

    //Method when action starts
    onStart(): void {
        this.hasFinished = false

        this.parent.TowerDuel?.CleanEntities()
        this.parent.TowerDuel?.lift?.Delete()
        if (this.parent.TowerDuel) {
            engine.removeSystem(this.parent.TowerDuel)
            this.parent.TowerDuel = undefined
        }
        this.hasFinished = true
    }
    //Method to run on every frame
    update(dt: number): void { }
    //Method to run at the end
    onFinish(): void {
        this.parent.launchGame()
    }
}

//Use IAction to define action for movement
export class GoToPlayAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    liftToGame: LiftToGame

    constructor(liftToGame: LiftToGame) {
        this.liftToGame = liftToGame
    }

    //Method when action starts
    onStart(): void {
        this.hasFinished = false
        this.liftToGame.lift.getComponent(AudioSource).audioClip.loop = true
        this.liftToGame.lift.getComponent(AudioSource).playing = true
        this.liftToGame.goToPlay()

        utils.setTimeout(this.liftToGame.liftMoveDuration * 1000, () => {
            this.liftToGame.lift.getComponent(AudioSource).playing = false
            this.hasFinished = true
        })
    }
    //Method to run on every frame
    update(dt: number): void { }
    //Method to run at the end
    onFinish(): void {
    }
}

//Use IAction to define action for movement
export class CleanAvatarsAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    messageBus: MessageBus
    parent: MainGame

    constructor(parent: MainGame, messageBus: MessageBus) {
        this.messageBus = messageBus
        this.parent = parent
    }

    //Method when action starts
    onStart(): void {
        this.hasFinished = false
        const modifierArea = new Entity()
        modifierArea.addComponent(
            new AvatarModifierArea({
                area: { box: new Vector3(32, 20, 32) },
                modifiers: [AvatarModifiers.HIDE_AVATARS], // DISABLE_PASSPORTS
            })
        )
        modifierArea.addComponent(
            new Transform({
                position: new Vector3(16, 0, 16),
            })
        )
        engine.addEntity(modifierArea)
        utils.setTimeout(1000, () => {
            this.hasFinished = true
            this.parent.launchGame()
        })
    }
    //Method to run on every frame
    update(dt: number): void { }
    //Method to run at the end
    onFinish(): void { }
}