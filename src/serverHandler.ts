import { IUser } from "./interfaces/class.interface"

// external servers being used by the project - Please change these to your own if working on something else!
export const fireBaseServer =
    'http://localhost:3000/scores/'
    // 'http://localhost:5001/dcl-tower-duel/us-central1/app/'
// 'https://us-central1-dcl-tower-duel.cloudfunctions.net/app/'

// get latest scoreboard data from server
export async function getScoreBoard() {
    try {
        const url = fireBaseServer + 'get-scores'
        const response = await fetch(url)
        const json = await response.json()
        log(json)
        return json
    } catch (e) {
        log('error fetching scores from server ', e)
    }
}

// change data in scoreboard
export async function publishScore(user: IUser, score: number) {
    try {
        const url = fireBaseServer + 'set-scores'
        const body = JSON.stringify({
            public_address: user.public_address,
            name: user.name,
            score: score.toString()
        })
        log(body)
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        })
        log("set-scores response", response)
        return await response.json()
    } catch (e) {
        log('error posting to server ', e)
    }
}