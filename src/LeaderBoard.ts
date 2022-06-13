import Game from "./game"
import { getScoreBoard } from "./serverHandler"

export class LeaderBoard {
    global: Entity = new Entity()
    layout: Entity = new Entity()
    nameTitle?: ScoreBoardText
    scoreTitle?: ScoreBoardText
    scoreBoardNames: ScoreBoardText[] = []
    scoreBoardValues: ScoreBoardText[] = []
    parent: Game
    fontSize: Vector3 = new Vector3(1.25, 1.25, 1.25)

    constructor(parent: Game) {
        this.parent = parent
        this.global.addComponent(
            new Transform({
                position: new Vector3(16, 12, .5),
                rotation: Quaternion.Euler(0, 180, 0),
                scale: new Vector3(2, 2, 2)
            })
        )
        this.updateBoard()
        engine.addEntity(this.global)
    }

    async updateBoard(newDatas?: any) {
        let scoreData: any = []
        if (newDatas) {
            log("updateBoard with newData")
            scoreData = newDatas
        }
        else {
            log("updateBoard without newData")
            scoreData = await getScoreBoard() // data.scoreBoard
        }
        this.buildLeaderBoard(scoreData, this.global, 9).catch((error) => log(error))
        this.parent.higherTower?.updateTower(scoreData[0].score)
    }

    async buildLeaderBoard(scoreData: any[], parent: Entity, length: number) {
        // if canvas is empty
        if (this.scoreBoardNames.length === 0) {
            this.nameTitle = new ScoreBoardText(TextTypes.BIGTITLE, 'Player', { position: new Vector3(-0.8, 0.65, 0), scale: this.fontSize }, parent)
            this.scoreTitle = new ScoreBoardText(TextTypes.BIGTITLE, 'Score', { position: new Vector3(0.8, 0.65, 0), scale: this.fontSize }, parent)

            for (let i = 0; i < length; i++) {
                if (i < scoreData.length) {
                    const name = new ScoreBoardText(TextTypes.TINYTITLE, scoreData[i].name, { position: new Vector3(-0.6, 0.2 - i / 4, 0), scale: this.fontSize }, parent)
                    this.scoreBoardNames.push(name)

                    const score = new ScoreBoardText(TextTypes.TINYVALUE, scoreData[i].score.toString(), { position: new Vector3(0.6, 0.2 - i / 4, 0), scale: this.fontSize }, parent)
                    this.scoreBoardValues.push(score)
                } else {
                    // create empty line

                    const name = new ScoreBoardText(TextTypes.TINYTITLE, '-', { position: new Vector3(-0.6, 0.2 - i / 4, 0), scale: this.fontSize }, parent)
                    this.scoreBoardNames.push(name)

                    const score = new ScoreBoardText(TextTypes.TINYVALUE, '-', { position: new Vector3(0.6, 0.2 - i / 4, 0), scale: this.fontSize }, parent)
                    this.scoreBoardValues.push(score)
                }
            }
        } else {
            // update existing board
            for (let i = 0; i < length; i++) {
                if (i > scoreData.length) continue
                this.scoreBoardNames[i].getComponent(TextShape).value = scoreData[i].name
                this.scoreBoardValues[i].getComponent(TextShape).value = scoreData[i].score
            }
        }
    }
}

export enum TextTypes {
    BIGTITLE = 'bigtitle',
    BIGVALUE = 'bigvalue',
    TITLE = 'title',
    LABEL = 'label',
    VALUE = 'value',
    UNIT = 'unit',
    TINYVALUE = 'tinyvalue',
    TINYTITLE = 'tinytitle'
}

export class ScoreBoardText extends Entity {
    TiltleFont = new Font(Fonts.SansSerif_Bold)
    SFFont = new Font(Fonts.SansSerif_Heavy)
    constructor(
        type: TextTypes,
        text: string,
        transform: TranformConstructorArgs,
        parent: Entity
    ) {
        super()
        engine.addEntity(this)

        this.addComponent(new Transform(transform))
        this.setParent(parent)

        const shape = new TextShape(text)

        shape.width = 10

        switch (type) {
            case TextTypes.BIGTITLE:
                shape.fontSize = 2
                shape.color = Color3.White()
                shape.vTextAlign = 'center'
                shape.font = this.TiltleFont
                break
            case TextTypes.BIGVALUE:
                shape.fontSize = 2
                shape.color = Color3.Green()
                shape.vTextAlign = 'center'
                shape.font = this.TiltleFont
                break

            case TextTypes.TITLE:
                shape.fontSize = 2
                shape.color = Color3.White()
                shape.vTextAlign = 'center'
                shape.width = 10
                shape.font = this.TiltleFont
                break
            case TextTypes.TINYTITLE:
                shape.fontSize = 1
                shape.color = Color3.White()
                shape.vTextAlign = 'center'
                shape.width = 10
                shape.font = this.SFFont
                break
            case TextTypes.LABEL:
                shape.fontSize = 2
                shape.color = Color3.White()
                shape.vTextAlign = 'left'
                shape.font = this.SFFont
                break
            case TextTypes.VALUE:
                shape.fontSize = 2
                shape.color = Color3.Green()
                shape.vTextAlign = 'right'
                shape.font = this.SFFont
                break
            case TextTypes.TINYVALUE:
                shape.fontSize = 1
                shape.color = Color3.Green()
                shape.vTextAlign = 'right'
                shape.font = this.SFFont
                break

            case TextTypes.UNIT:
                shape.fontSize = 2
                shape.color = Color3.White()
                shape.vTextAlign = 'right'
                shape.font = this.SFFont
                break
        }

        this.addComponent(shape)
    }
}

