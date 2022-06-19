import MainGame from "@/mainGame"
import TowerDuel from "@/towerDuel"
import { ActionsSequenceSystem, setTimeout } from '@dcl/ecs-scene-utils'
import { displayAnnouncement, hideAnnouncements } from '@dcl/ui-scene-utils'

export class StarterTimerAction implements ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame
    physicsMaterial: CANNON.Material
    world: CANNON.World
    counter: number = 5

    constructor(parent: MainGame, physicsMaterial: CANNON.Material, world: CANNON.World) {
        this.parent = parent
        this.physicsMaterial = physicsMaterial
        this.world = world
    }

    onStart(): void {
        this.count()
    }

    count() {
        if (this.counter < 0) {
            this.hasFinished = true
            return
        }
        this.displayCount(this.counter)
        setTimeout(1100, () => {
            this.counter--
            this.count()
        })
    }

    displayCount(val: number) {
        displayAnnouncement(val.toString(), 1, Color4.Red(), 50, true)
    }
    update(dt: number): void {
    }

    onFinish(): void {
        hideAnnouncements()
        this.parent.parent.messageBus.emit("StarterButton_" + this.parent.TowerDuel?.towerDuelId, {})
    }
}

export class LaunchSoloGameAction implements ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame
    physicsMaterial: CANNON.Material
    world: CANNON.World

    constructor(parent: MainGame, physicsMaterial: CANNON.Material, world: CANNON.World) {
        this.parent = parent
        this.physicsMaterial = physicsMaterial
        this.world = world
    }

    onStart(): void {
        if (this.parent.side === 'left') {
            this.parent.TowerDuel = new TowerDuel(this.physicsMaterial, this.world, this.parent, new Vector3(16, 0, 0))
        } else {
            this.parent.TowerDuel = new TowerDuel(this.physicsMaterial, this.world, this.parent, new Vector3(0, 0, 0))
        }
        this.hasFinished = true
    }

    update(dt: number): void { }

    onFinish(): void { }
}

export class LaunchMultGameAction implements ActionsSequenceSystem.IAction {
    hasFinished: boolean = false
    parent: MainGame
    physicsMaterial: CANNON.Material
    world: CANNON.World

    constructor(parent: MainGame, physicsMaterial: CANNON.Material, world: CANNON.World) {
        this.parent = parent
        this.physicsMaterial = physicsMaterial
        this.world = world
    }

    onStart(): void {
        this.parent.TowerDuel?.CleanEntities()
        this.parent.parent.messageBus.emit('addUserInGame_' + this.parent.parent.userConnection?.userData.realm, { user: this.parent.parent.userConnection?.userData, side: this.parent.side, lastDate: this.parent.parent.lobbyScreen?.gameLastUpdate })
        this.parent.TowerDuel = new TowerDuel(this.physicsMaterial, this.world, this.parent, new Vector3(16, 0, 0))
        this.hasFinished = true
    }

    update(dt: number): void { }

    onFinish(): void { }
}
