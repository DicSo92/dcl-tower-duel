import { getUserData } from '@decentraland/Identity'
import { getCurrentRealm } from '@decentraland/EnvironmentAPI'
import { IUser } from './interfaces/class.interface'
import LobbyScreen from './lobbyScreen'
import { movePlayerTo } from '@decentraland/RestrictedActions'

export class UserConnection {
    userData: IUser = { public_address: "", name: "", realm: "", ws_id: "", room: "" }
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
            const msg = JSON.parse(event.data)
            // -----------------------------------------------------------------------------------------------
            if (msg.event === 'setData_' + this.userData.public_address) {
                this.userData = msg.data.user
                this.parent.usersInGame = msg.data.usersInGame
                this.parent.usersInQueue = msg.data.usersInQueue
            }
            // -----------------------------------------------------------------------------------------------
            else if (msg.event === 'userConfirmGame_' + this.userData.public_address) {
                this.parent.parent.modeSelection()
            }
            // -----------------------------------------------------------------------------------------------
            else if (msg.event === 'newGame_' + this.userData.public_address) {
                if (msg.data.side === 'left') {
                    movePlayerTo(new Vector3(24, .1, 24), new Vector3(24, 0, 8)).then(() => {
                        this.parent.parent.mainGame0?.gameApprovalSolo()
                        this.parent.parent.mainGame0?.liftToGame.entity.getComponent(AudioSource).playOnce()
                    })
                } else if (msg.data.side === 'right') {
                    movePlayerTo(new Vector3(8, .1, 24), new Vector3(8, 0, 8)).then(() => {
                        this.parent.parent.mainGame1?.gameApprovalSolo()
                        this.parent.parent.mainGame1?.liftToGame.entity.getComponent(AudioSource).playOnce()
                    })
                }
            }
            // -----------------------------------------------------------------------------------------------
            else if (msg.event === 'updateQueue') {
                this.parent.updateQueue(msg.data.queue)
             }
        }
        this.socket.onopen = async () => {
            const data = { user: this.userData }
            this.socket?.send(JSON.stringify({ event: 'join', data: data }))
        }
    }

    public getUserData() {
        return this.userData
    }
}