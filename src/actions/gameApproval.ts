import LiftToGame from '@/liftToGame'
import MainGame from '@/mainGame'
import { ActionsSequenceSystem, setTimeout } from '@dcl/ecs-scene-utils'

//Use IAction to define action for movement
export class CleanTowerDuelAction implements ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame

    constructor(parent: MainGame) {
        this.parent = parent
    }

    //Method when action starts
    onStart(): void {
        this.hasFinished = false

        this.parent.TowerDuel?.CleanEntities()
        if (this.parent.TowerDuel?.lift) this.parent.TowerDuel?.lift?.Delete()
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
export class GoToPlayAction implements ActionsSequenceSystem.IAction {
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
        setTimeout(1000, () => {
            this.liftToGame.goToPlay(this)
        })
    }
    //Method to run on every frame
    update(dt: number): void { }
    //Method to run at the end
    onFinish(): void { }
}

//Use IAction to define action for movement
export class CleanAvatarsAction implements ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame

    constructor(parent: MainGame) {
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
        setTimeout(1000, () => {
            this.hasFinished = true
            this.parent.launchGame()
        })
    }
    //Method to run on every frame
    update(dt: number): void { }
    //Method to run at the end
    onFinish(): void { }
}