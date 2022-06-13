import { IUser } from "./interfaces/class.interface"

// external servers being used by the project - Please change these to your own if working on something else!
export const fireBaseServer = 'https://dcl-tower-duel-server.herokuapp.com/'

    export const fireBaseBucketScore = "scores/"

// get latest scoreboard data from server
export async function getScoreBoard() {
    try {
        const url = fireBaseServer + fireBaseBucketScore + 'get-scores'
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
        const url = fireBaseServer + fireBaseBucketScore + 'set-scores'
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