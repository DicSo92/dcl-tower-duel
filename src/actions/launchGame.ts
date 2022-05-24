import MainGame from "@/mainGame"
import TowerDuel from "@/towerDuel"
import * as utils from '@dcl/ecs-scene-utils'

//Use IAction to define action for movement
export class LaunchGameAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus

    constructor(parent: MainGame, physicsMaterial: CANNON.Material, world: CANNON.World, messageBus: MessageBus) {
        this.parent = parent
        this.physicsMaterial = physicsMaterial
        this.world = world
        this.messageBus = messageBus
    }

    //Method when action starts
    onStart(): void {
        this.parent.TowerDuel.push(new TowerDuel(this.physicsMaterial, this.world, this.parent, this.messageBus))
        this.hasFinished = true
    }
    //Method to run on every frame
    update(dt: number): void { }
    //Method to run at the end
    onFinish(): void { }
}
