import {
    MoveTransformComponent,
    ScaleTransformComponent,
    ToggleComponent,
    ToggleState
} from "@dcl/ecs-scene-utils";
import Game from "./game";
import * as utils from "@dcl/ecs-scene-utils"

export default class LobbyScreen implements ISystem {
    parent: Game

    container: Entity
    screen: Entity
    borderModel : GLTFShape
    title: Entity
    borderTopLeft?: Entity
    borderTopRight?: Entity
    borderBotLeft?: Entity
    borderBotRight?: Entity

    animationDuration: number = 0.6
    titleOffsetTop: number = 0.55
    queueTitle: string = "---- QUEUE ----"
    rulesTitle: string = "---- RULES ----"
    queueScale: Vector3 = new Vector3(2.75, 3, 0.05)
    rulesScale: Vector3 = new Vector3(5, 3.2, 0.05)
    playBtn: Entity = new Entity();
    rulesBtn: Entity = new Entity();

    constructor(parent: Game, position: Vector3) {
        this.parent = parent

        this.container = new Entity()
        this.container.addComponent(new Transform({ position: position }))
        engine.addEntity(this.container)

        this.screen = new Entity()
        this.title = new Entity()
        this.title.setParent(this.container)
        this.borderModel = new GLTFShape('models/glassAngles.glb')

        this.Init()
    }
    Init = () => {
        this.BuildScreen()
        this.BuildBorders()
        this.BuildButtons()
        this.BuildToggleEvent()
        this.setTitleText(this.queueScale, this.queueTitle)
    }
    // -----------------------------------------------------------------------------------------------------------------
    private BuildToggleEvent = () => {
        this.container.addComponent(new ToggleComponent(ToggleState.On,(value: ToggleState) => {
            const newScale = value ? this.queueScale : this.rulesScale

            this.title.getComponent(TextShape).opacity = 0

            this.screen.addComponentOrReplace(new ScaleTransformComponent(this.screen.getComponent(Transform).scale, newScale, this.animationDuration, () => {
                this.setTitleText(newScale, value ? this.queueTitle : this.rulesTitle)

                const titleText = new TextShape(value ? this.queueTitle : this.rulesTitle)
                titleText.fontSize = 2
                this.title.addComponentOrReplace(titleText)
                this.title.getComponent(Transform).position = this.titlePosition(newScale)
            }))
            this.screen.addComponentOrReplace(new MoveTransformComponent(this.screen.getComponent(Transform).position, new Vector3(0, newScale.y / 2, 0), this.animationDuration))

            this.borderTopLeft?.addComponentOrReplace(new MoveTransformComponent(
                this.borderTopLeft?.getComponent(Transform).position,
                this.positionTopLeft(newScale),
                this.animationDuration
            ))
            this.borderTopRight?.addComponentOrReplace(new MoveTransformComponent(
                this.borderTopRight?.getComponent(Transform).position,
                this.positionTopRight(newScale),
                this.animationDuration
            ))
            this.borderBotLeft?.addComponentOrReplace(new MoveTransformComponent(
                this.borderBotLeft?.getComponent(Transform).position,
                this.positionBotLeft(newScale),
                this.animationDuration
            ))
            this.borderBotRight?.addComponentOrReplace(new MoveTransformComponent(
                this.borderBotRight?.getComponent(Transform).position,
                this.positionBotRight(newScale),
                this.animationDuration
            ))
        }))
    }
    // -----------------------------------------------------------------------------------------------------------------
    private positionTopLeft(screenScale: Vector3): Vector3 {
        return new Vector3(screenScale.x / 2, screenScale.y, 0)
    }
    private positionTopRight(screenScale: Vector3): Vector3 {
        return new Vector3(-(screenScale.x / 2), screenScale.y, 0)
    }
    private positionBotLeft(screenScale: Vector3): Vector3 {
        return new Vector3(screenScale.x / 2, 0, 0)
    }
    private positionBotRight(screenScale: Vector3): Vector3 {
        return new Vector3(-(screenScale.x / 2), 0, 0)
    }
    private titlePosition(screenScale: Vector3) : Vector3{
        return new Vector3(0, screenScale.y - this.titleOffsetTop, 0.05)
    }
    // -----------------------------------------------------------------------------------------------------------------
    private setTitleText (screenScale: Vector3, text: string) {
        const titleText = new TextShape(text)
        titleText.fontSize = 2
        this.title.addComponentOrReplace(titleText)
        this.title.addComponentOrReplace(new Transform({
            position: this.titlePosition(screenScale)
        }))
        this.title.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 180, 0)
    }
    // -----------------------------------------------------------------------------------------------------------------
    BuildScreen = () => {
        this.screen.addComponentOrReplace(new BoxShape())
        this.screen.addComponentOrReplace(new Transform({
            position: new Vector3(0, this.queueScale.y / 2, 0),
            scale: this.queueScale
        }))
        const screenMaterial = new Material()
        screenMaterial.albedoColor = new Color4(0.65, 0.90, 0.95, 0.4)
        screenMaterial.metallic = 0.5
        screenMaterial.roughness = 0.1
        this.screen.addComponentOrReplace(screenMaterial)
        this.screen.setParent(this.container)
    }
    // -----------------------------------------------------------------------------------------------------------------
    BuildBorders = () => {
        this.borderTopLeft = new Entity()
        this.borderTopLeft.addComponent(this.borderModel)
        this.borderTopLeft.addComponent(new Transform({
            position: this.positionTopLeft(this.queueScale),
        }))
        this.borderTopLeft.getComponent(Transform).rotation.eulerAngles = new Vector3(0, -90, 0)
        this.borderTopLeft.setParent(this.container)
        // -----------------------------------------
        this.borderTopRight = new Entity()
        this.borderTopRight.addComponent(this.borderModel)
        this.borderTopRight.addComponent(new Transform({
            position: this.positionTopRight(this.queueScale),
        }))
        this.borderTopRight.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 0)
        this.borderTopRight.setParent(this.container)
        // -----------------------------------------
        this.borderBotLeft = new Entity()
        this.borderBotLeft.addComponent(this.borderModel)
        this.borderBotLeft.addComponent(new Transform({
            position: this.positionBotLeft(this.queueScale),
        }))
        this.borderBotLeft.getComponent(Transform).rotation.eulerAngles = new Vector3(0, -90, -180)
        this.borderBotLeft.setParent(this.container)
        // -----------------------------------------
        this.borderBotRight = new Entity()
        this.borderBotRight.addComponent(this.borderModel)
        this.borderBotRight.addComponent(new Transform({
            position: this.positionBotRight(this.queueScale),
        }))
        this.borderBotRight.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 180)
        this.borderBotRight.setParent(this.container)
    }
    // -----------------------------------------------------------------------------------------------------------------
    BuildButtons = () => {
        this.rulesBtn.addComponent(new Transform({
            position: new Vector3(-0.6, 0, 1),
            scale: new Vector3(1, 1, 1)
        }))
        this.rulesBtn.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 0)
        this.rulesBtn.addComponent(this.parent.sceneAssets.rulesBtn)
        const rbtnAnimator = new Animator()
        this.parent.sceneAssets.rulesBtnAnimStates.forEach(item => {
            if (item.clip === 'rotationZBezier') {
                item.looping = true
            }
            else {
                item.looping = false
            }
            item.stop()
            rbtnAnimator.addClip(item)
        })
        this.rulesBtn.addComponent(rbtnAnimator)
        // this.rulesBtn.getComponent(Animator).getClip('rotXBezier').play()
        this.rulesBtn.getComponent(Animator).getClip('rotationZBezier').play()
        this.rulesBtn.addComponent(new OnPointerDown(() => {
            log('rules click')
            this.rulesBtn.getComponent(Animator).getClip('viberBorderXLinear').play()
            this.container.getComponent(ToggleComponent).toggle()
        }, {
            button: ActionButton.POINTER,
            showFeedback: true,
            hoverText: "Rules",
        }))
        this.rulesBtn.setParent(this.container)

        // this.rulesBtn.addComponentOrReplace(new utils.Delay(1000, () => {
        // log("Play rulesBtn.rotationYBezier")
        // this.rulesBtn.getComponent(Animator).getClip('rotationYBezier').play()
        // this.rulesBtn.getComponent(Animator).getClip('rotationZBezier').play()
        // this.rulesBtn.getComponent(Animator).getClip('rotationYLinear').play()
        // this.rulesBtn.getComponent(Animator).getClip('stopping').play()
        // log("Playing rulesBtn.rotationYBezier")
        // this.rulesBtn.getComponent(Animator).getClip('rotationYBezier').stop()
        // log("Stopping rulesBtn.rotationYBezier")
        // }))
        this.playBtn.addComponent(new Transform({
            position: new Vector3(0.6, 0, 1),
            scale: new Vector3(1, 1, 1)
        }))
        this.playBtn.getComponent(Transform).rotation.eulerAngles = new Vector3(0, 90, 0)
        this.playBtn.addComponent(this.parent.sceneAssets.playBtn)
        const pbtnAnimator = new Animator()
        this.parent.sceneAssets.playBtnAnimStates.forEach(item => {
            if (item.clip === 'stopped') {
                log("Play playBtn.stopped", item)
                item.looping = true
                // item.play()
                item.stop()
            } else if (item.clip === 'rotX') {
                log("Play playBtn.stopped", item)
                item.looping = true
                // item.play()
                item.stop()
            }
            else {
                log("Play !playBtn.stopped", item)
                item.looping = true
                item.stop()
                // item.reset()
            }
            pbtnAnimator.addClip(item)
        })
        this.playBtn.addComponent(pbtnAnimator)
        this.playBtn.addComponent(new OnPointerDown(() => {
            log('play click')
        }, {
            button: ActionButton.POINTER,
            showFeedback: true,
            hoverText: "Play",
        }))
        this.playBtn.setParent(this.container)

        // this.playBtn.addComponentOrReplace(new utils.Delay(1000, () => {
            // log("Play playBtn.rotationYBezier")
            // this.playBtn.getComponent(Animator).getClip('rotationYBezier').play()
            // this.playBtn.getComponent(Animator).getClip('rotationZBezier').play()
            // this.playBtn.getComponent(Animator).getClip('rotXBezier').play()
            // this.playBtn.getComponent(Animator).getClip('rotationYLinear').play()
            // this.playBtn.getComponent(Animator).getClip('stopping').play()
            // log("Playing playBtn.rotationYBezier")
            // this.playBtn.getComponent(Animator).getClip('rotationYBezier').stop()
            // log("Stopping playBtn.rotationYBezier")
        // }))
        // -------------------------------------------------
        // -------------------------------------------------
        // const playBtn = new Entity()
        // playBtn.addComponent(new BoxShape())
        // playBtn.addComponent(new Transform({
        //     scale: new Vector3(0.5, 0.15, 0.3),
        //     position: new Vector3(0.4, 0, 1),
        // }))
        // playBtn.getComponent(Transform).rotation.eulerAngles = new Vector3(40, 0, 0)
        // playBtn.addComponent(new OnPointerDown(() => {
        //     log('play click')
        // }, {
        //     button: ActionButton.POINTER,
        //     showFeedback: true,
        //     hoverText: "Play",
        // }))
        // playBtn.setParent(this.container)
        // -------------------------------------------------
        // -------------------------------------------------
        // const infosBtn = new Entity()
        // infosBtn.addComponent(new BoxShape())
        // infosBtn.addComponent(new Transform({
        //     scale: new Vector3(0.5, 0.15, 0.3),
        //     position: new Vector3(-0.4, 0, 1),
        // }))
        // infosBtn.getComponent(Transform).rotation.eulerAngles = new Vector3(40, 0, 0)
        // infosBtn.addComponent(new OnPointerDown(() => {
        //     log('rules click')
        //     this.container.getComponent(ToggleComponent).toggle()
        // }, {
        //     button: ActionButton.POINTER,
        //     showFeedback: true,
        //     hoverText: "Rules",
        // }))
        // infosBtn.setParent(this.container)
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
