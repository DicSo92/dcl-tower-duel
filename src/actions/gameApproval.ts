import { ITowerDuel } from '@/interfaces/class.interface'
import liftToGame from '@/liftToGame'
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

        utils.setTimeout(5000, () => {
            this.parent.TowerDuel.forEach((item: ITowerDuel) => {
                item.CleanEntities()
                engine.removeSystem(item)
            })
            if (this.parent.TowerDuel.length > 0) {
                this.parent.TowerDuel[0].lift?.Delete()
                engine.removeSystem(this.parent.TowerDuel[0])
                this.parent.TowerDuel = []
            }
            this.hasFinished = true
        })
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
    liftToGame: liftToGame

    constructor(liftToGame: liftToGame) {
        this.liftToGame = liftToGame
    }

    //Method when action starts
    onStart(): void {
        this.hasFinished = false
        this.liftToGame.goToPlay()

        utils.setTimeout(100, () => {
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