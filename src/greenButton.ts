export default class GreenButton implements ISystem {
    entity: Entity;
    transform: Transform
    messageBus: MessageBus
    clip = new AudioClip('sounds/click.mp3');

    constructor(transform: Transform, messageBus: MessageBus) {
        this.entity = new Entity()
        this.transform = transform
        this.messageBus = messageBus
        this.Init()
    }
    Init = () => {
        this.buildButton()
        this.buildPole()
        this.buildEvents()
        this.setAnimator()
    }
    // -----------------------------------------------------------------------------------------------------------------
    buildButton = () => {
        this.entity.addComponent(this.transform)
        engine.addEntity(this.entity)
        this.entity.addComponent(new GLTFShape('models/Green_Button.glb'))
    }
    buildPole = () => {
        const btnPole = new Entity()
        btnPole.setParent(this.entity)

        btnPole.addComponent(new Transform({
            position: new Vector3(0, -0.3, 0),
            rotation: new Quaternion(0, 0, 0, 1),
            scale: new Vector3(0.1, 0.30, 0.1)
        }))
        btnPole.addComponent(new CylinderShape())
    }
    buildEvents = () => {
        this.entity.addComponent(
            new OnPointerDown(() => {
                log('greenButton click')
                this.play()
                this.messageBus.emit("greenButtonClick", {
                    test: "text test"
                })
            }, {
                button: ActionButton.POINTER,
                showFeedback: true,
                hoverText: "Spawn Block",
            })
        )
    }
    setAnimator = () => {
        const animator = new Animator()
        const clip = new AnimationState('trigger', { looping: false })
        animator.addClip(clip)
        this.entity.addComponent(animator)
    }


    play() {
        const source = new AudioSource(this.clip)
        this.entity.addComponentOrReplace(source)
        source.playing = true

        const animator = this.entity.getComponent(Animator)
        const clip = animator.getClip('trigger')
        clip.stop()
        clip.play()
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
