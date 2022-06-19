import { getUserData } from '@decentraland/Identity'
import { getCurrentRealm } from '@decentraland/EnvironmentAPI'
import { IUser } from './interfaces/class.interface'
import LobbyScreen from './lobbyScreen'
import { movePlayerTo } from '@decentraland/RestrictedActions'

export class UserConnection {
    userData: IUser = { name: "", public_address: "", realm: "" }
    socket?: WebSocket
    parent: LobbyScreen

    constructor(parent: LobbyScreen) {
        this.parent = parent
        this.Init()
    }

    Init = async () => {
        await this.getUser()
        await this.getRealm()
        await this.BuildSocket()
    }

    async getUser() {
        try {
            let data = await getUserData()
            if (data) {
                this.userData.name = data.displayName
                this.userData.public_address = data.userId
            }
        } catch {
            log("Failed to get user")
        }
    }

    async getRealm() {
        try {
            let realm = await getCurrentRealm()
            if (realm) this.userData.realm = realm.domain
        } catch {
            log("Failed to get user")
        }
    }

    async BuildSocket() {
        this.socket = new WebSocket("ws://localhost:8080")
        this.socket.onmessage = async (event) => {
            log("socket.onmessage", event)
            const msg = JSON.parse(event.data)
            log('socket message:', msg)
            if (msg.event === 'setData_' + this.userData.public_address) {
                log('setData in user ', this.userData.public_address)
                this.parent.usersInGame = msg.usersInGame
                this.parent.usersInQueue = msg.usersInQueue
            } else if (msg.event === 'userConfirmGame_' + this.userData.public_address) {
                log('userConfirmGame_ ', this.userData.public_address, 'side: ', msg.side)
                if (msg.side === 'left' && !this.parent.parent.mainGame0?.isActiveSequence && !this.parent.parent.mainGame0?.isActive) {
                    log('left')
                    this.parent.parent.mainGame0?.modeSelection()
                } else if (msg.side === 'right' && !this.parent.parent.mainGame1?.isActiveSequence && !this.parent.parent.mainGame1?.isActive) {
                    log('right')
                    this.parent.parent.mainGame1?.modeSelection()
                }
            } else if (msg.event === 'newGame_' + this.userData.public_address) {
                if (msg.side === 'left') {
                    movePlayerTo(new Vector3(24, .1, 24), new Vector3(24, 0, 8)).then(() => {
                        this.parent.parent.mainGame0?.gameApprovalSolo()
                        this.parent.parent.mainGame0?.liftToGame.entity.getComponent(AudioSource).playOnce()
                    })
                } else if (msg.side === 'right' && this.parent.parent.mainGame1?.isActiveSequence) {
                    movePlayerTo(new Vector3(8, .1, 24), new Vector3(8, 0, 8)).then(() => {
                        this.parent.parent.mainGame1?.gameApprovalSolo()
                        this.parent.parent.mainGame1?.liftToGame.entity.getComponent(AudioSource).playOnce()
                    })
                }
            }
        }
        this.socket.onopen = async () => {
            log('BuildSocket.onopen')
            // this.socket?.send(JSON.stringify({ event: 'join', data: { public_address: this.userData.public_address, name: this.userData.name, realm: this.userData.realm, room: 'global' } }))
            this.socket?.send(JSON.stringify({ event: 'join', user: this.userData }))
        }
    }

    public getUserData() {
        return this.userData
    }
}