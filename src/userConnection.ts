import { getUserData } from '@decentraland/Identity'
import { getCurrentRealm } from '@decentraland/EnvironmentAPI'
import { IUser } from './interfaces/class.interface'
import LobbyScreen from './lobbyScreen'
import { movePlayerTo } from '@decentraland/RestrictedActions'
import Game from './game'

export class UserConnection {
    userData: IUser = { public_address: "", name: "", realm: "", ws_id: "", room: "" }
    socket?: WebSocket
    parent: Game

    constructor(parent: Game) {
        this.parent = parent
        this.Init()
    }

    Init = async () => {
        await this.getUser()
        await this.getRealm()
        await this.BuildSocket()

        this.parent.leaderBoard?.updateBoard()
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
                if (this.parent.lobbyScreen) {
                    this.parent.lobbyScreen.usersInGame = msg.data.usersInGame
                    this.parent.lobbyScreen.usersInQueue = msg.data.usersInQueue
                }
            }
            // -----------------------------------------------------------------------------------------------
            else if (msg.event === 'userConfirmGame_' + this.userData.public_address) {
                this.parent.modeSelection()
            }
            // -----------------------------------------------------------------------------------------------
            else if (msg.event === 'newGame_' + this.userData.public_address) {
                if (msg.data.side === 'left') {
                    movePlayerTo(new Vector3(24, .1, 24), new Vector3(24, 0, 8)).then(() => {
                        this.parent.mainGame0?.gameApprovalSolo()
                        this.parent.mainGame0?.liftToGame.entity.getComponent(AudioSource).playOnce()
                    })
                } else if (msg.data.side === 'right') {
                    movePlayerTo(new Vector3(8, .1, 24), new Vector3(8, 0, 8)).then(() => {
                        this.parent.mainGame1?.gameApprovalSolo()
                        this.parent.mainGame1?.liftToGame.entity.getComponent(AudioSource).playOnce()
                    })
                }
            }
            // -----------------------------------------------------------------------------------------------
            else if (msg.event === 'updateQueue') {
                this.parent.lobbyScreen?.updateQueue(msg.data.queue)
            }
            // -----------------------------------------------------------------------------------------------
            else if (msg.event === 'getScores_' + this.getUserData().public_address) {
                let scores = msg.data.scores
                log('onGetScores', scores)
                if (this.parent.leaderBoard) {
                    this.parent.leaderBoard.scoreData = msg.data.scores
                }
                this.parent.leaderBoard?.buildLeaderBoard(scores, this.parent.leaderBoard?.global, 9).catch((error: any) => log(error))
                this.parent.higherTower?.updateTower(scores[0].score)
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