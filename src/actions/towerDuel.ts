import TowerDuel from "@/towerDuel"
import * as utils from '@dcl/ecs-scene-utils'

//Use IAction to define action for movement
export class StartTowerDuelAction implements utils.ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    towerDuel?: TowerDuel
    physicsMaterial: CANNON.Material
    world: CANNON.World
    messageBus: MessageBus

    constructor(physicsMaterial: CANNON.Material, world: CANNON.World, messageBus: MessageBus) {
        this.physicsMaterial = physicsMaterial
        this.world = world
        this.messageBus = messageBus
    }

    //Method when action starts
    onStart(): void {
        this.towerDuel = new TowerDuel(this.physicsMaterial, this.world, this.messageBus)
        this.hasFinished = true
    }
    //Method to run on every frame
    update(dt: number): void { }
    //Method to run at the end
    onFinish(): void { }
}
