import { ITowerDuel } from "@/interfaces/class.interface"
import MainGame from "@/mainGame"
import TowerDuel from "@/towerDuel"
import * as utils from '@dcl/ecs-scene-utils'

//Use IAction to define action for movement
export class LaunchSoloGameAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame
    physicsMaterial: CANNON.Material
    world: CANNON.World

    constructor(parent: MainGame, physicsMaterial: CANNON.Material, world: CANNON.World) {
        this.parent = parent
        this.physicsMaterial = physicsMaterial
        this.world = world
    }

    //Method when action starts
    onStart(): void {
        this.parent.messageBus.emit('addUserInGame', {
            user: this.parent.parent.userId
        })
        this.parent.TowerDuel[0] = new TowerDuel(this.physicsMaterial, this.world, this.parent)
        this.hasFinished = true
    }
    //Method to run on every frame
    update(dt: number): void { }
    //Method to run at the end
    onFinish(): void { }
}
//Use IAction to define action for movement
export class LaunchMultGameAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame
    physicsMaterial: CANNON.Material
    world: CANNON.World

    constructor(parent: MainGame, physicsMaterial: CANNON.Material, world: CANNON.World) {
        this.parent = parent
        this.physicsMaterial = physicsMaterial
        this.world = world
    }

    //Method when action starts
    onStart(): void {
        this.parent.TowerDuel.forEach((item: ITowerDuel) => {
            item.CleanEntities()
        })
        this.parent.messageBus.emit('addUserInGame', {
            user: this.parent.parent.userId
        })
        this.parent.TowerDuel.push(new TowerDuel(this.physicsMaterial, this.world, this.parent))
        this.hasFinished = true
    }
    //Method to run on every frame
    update(dt: number): void { }
    //Method to run at the end
    onFinish(): void { }
}
