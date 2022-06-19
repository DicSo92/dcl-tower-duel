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

// how often the lastKicker player sends updates to server, in seconds
// const updateInterval = 5

// const local: boolean = false

// export let userData
// export let alteredUserName

// // types of data sent over websockets
// export enum dataType {
//     PING,
//     PICK,
//     THROW,
//     SYNC,
//     SCORE
// }

// const server = local
//     ? 'ws://localhost:8081/'
//     : 'wss://64-225-45-232.nip.io/broadcast/'

// export async function joinSocketsServer() {
//     // keep players in different realms in separate rooms for the ws server
//     log('about to get the user data')
//     userData = await getUserData()
//     alteredUserName = userData.displayName + Math.floor(Math.random() * 10000)

//     const realm = await getCurrentRealm() // { displayName: 'pepito' } //

//     log(`You are in the realm: `, realm.displayName)
//     // connect to websockets server
//     const socket = await new WebSocket(server + realm.displayName + '-basket')

//     log('socket connection to: ', server + realm.displayName + '-basket')

//     // for each ws message that arrives
//     socket.onmessage = async function (event) {
//         try {
//             const msg = JSON.parse(event.data)
//             log(msg)

//             // ignore messages from the same player
//             if (msg.data.user === alteredUserName) {
//                 log('ignoring own message')
//                 return
//             }

//             switch (msg.type) {
//                 case dataType.THROW:
//                     ball.otherThrow(
//                         msg.data.pos,
//                         msg.data.rot,
//                         msg.data.dir,
//                         msg.data.vel
//                     )
//                     break
//                 case dataType.PICK:
//                     ball.otherPickUp(msg.data.user, msg.data.pos, msg.data.streak)
//                     break
//                 case dataType.SYNC:
//                     ball.setPos(msg.data.pos, msg.data.rot, msg.data.holding)
//                     break
//                 case dataType.SCORE:
//                     //ball.setPos(msg.data.score, msg.data.threePoints)
//                     break
//             }
//         } catch (error) {
//             log(error)
//         }
//     }

//     socket.onerror = (res) => {
//         log('wss ERR ', res)
//     }

//     socket.onclose = (res) => {
//         log('DISCONNECTED FROM SERVER', socket.readyState)
//     }

//     engine.addSystem(new pingSystem(socket))

//     engine.addSystem(new updateSystem(socket))

//     return socket
// }

// class pingSystem implements ISystem {
//     timer: number = 0
//     socket: WebSocket
//     update(dt: number): void {
//         this.timer += dt
//         if (this.timer >= 10) {
//             this.timer = 0

//             this.socket.send(
//                 JSON.stringify({
//                     type: dataType.PING,
//                     data: {}
//                 })
//             )
//         }
//     }
//     constructor(socket: WebSocket) {
//         this.socket = socket
//     }
// }

// class updateSystem implements ISystem {
//     interval: number = updateInterval
//     socket: WebSocket
//     update(dt: number): void {
//         // send updated to server at a regular interval
//         if (ball.lastHolder) {
//             this.interval -= dt
//             if (this.interval < 0) {
//                 this.interval = updateInterval

//                 this.socket.send(
//                     JSON.stringify({
//                         type: dataType.SYNC,
//                         holding: ball.holding,
//                         pos: ball.getComponent(Transform).position,
//                         rot: ball.getComponent(Transform).rotation
//                     })
//                 )
//             }
//         }
//     }
//     constructor(socket: WebSocket) {
//         this.socket = socket
//     }
// }