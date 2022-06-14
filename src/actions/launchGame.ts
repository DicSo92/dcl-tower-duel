import MainGame from "@/mainGame"
import TowerDuel from "@/towerDuel"
import * as utils from '@dcl/ecs-scene-utils'
import * as ui from '@dcl/ui-scene-utils'

//Use IAction to define action for movement
export class StarterTimerAction implements utils.ActionsSequenceSystem.IAction {
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
        utils.setTimeout(1100, () => {
            this.counter--
            this.count()
        })
    }

    displayCount(val: number) {
        ui.displayAnnouncement(val.toString(), 1, Color4.Red(), 50, true)
    }
    update(dt: number): void {
    }

    onFinish(): void {
        ui.hideAnnouncements()
        this.parent.messageBus.emit("StarterButton_" + this.parent.TowerDuel?.towerDuelId, {})
    }
}

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

    onStart(): void {
        log("launchGame.onStart", this.parent.side)
        this.parent.messageBus.emit('addUserInGame_' + this.parent.parent.user.realm, {
            user: this.parent.parent.user, side: this.parent.side, lastUpdate: this.parent.parent.lobbyScreen?.gameLastUpdate
        })
        if (this.parent.side === 'left') {
            this.parent.TowerDuel = new TowerDuel(this.physicsMaterial, this.world, this.parent, new Vector3(16, 0, 0))
        } else {
            this.parent.TowerDuel = new TowerDuel(this.physicsMaterial, this.world, this.parent, new Vector3(0, 0, 0))
        }
        this.hasFinished = true
    }

    update(dt: number): void { }

    onFinish(): void {    }
}

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

    onStart(): void {
        this.parent.TowerDuel?.CleanEntities()
        this.parent.messageBus.emit('addUserInGame_' + this.parent.parent.user.realm, {
            user: this.parent.parent.user.public_address
        })
        this.parent.TowerDuel = new TowerDuel(this.physicsMaterial, this.world, this.parent, new Vector3(16, 0, 0))
        this.hasFinished = true
    }

    update(dt: number): void { }

    onFinish(): void { }
}
