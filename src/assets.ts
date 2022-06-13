const COLORS: string[] = [
    "#7400B8",
    "#6930C3",
    "#5E60CE",
    "#5390D9",
    "#4EA8DE",
    "#48BFE3",
    "#56CFE1",
    "#64DFDF",
    "#72EFDD",
    "#80FFDB",
]

export class GameAssets {
    liftOpen: GLTFShape
    liftClose: GLTFShape
    staminaBar: GLTFShape

    blockMaterials: Material[] = []
    glowMaterial: Material
    noGlowMaterial: Material

    constructor() {
        this.staminaBar = new GLTFShape('models/StaminaFlat.glb')

        COLORS.forEach(color => {
            const material = new Material()
            material.albedoColor = Color3.FromHexString(color)
            material.metallic = 0.0
            material.roughness = 1.0
            this.blockMaterials.push(material)
        })

        const glowMaterial = new Material()
        glowMaterial.albedoColor = Color3.Yellow()
        glowMaterial.metallic = 0.0
        glowMaterial.roughness = 1.0
        glowMaterial.emissiveColor = new Color3(1.325, 1.125, 0.0)
        this.glowMaterial = glowMaterial

        const noGlowMaterial = new Material()
        noGlowMaterial.albedoColor = new Color3(0.1, 0.1, 0.1)
        noGlowMaterial.metallic = 0.0
        noGlowMaterial.roughness = 1.0
        noGlowMaterial.emissiveColor = new Color3(0, 1.1, 1.3)
        this.noGlowMaterial = noGlowMaterial

        this.liftOpen = new GLTFShape('models/liftToGameWithInvi.glb')
        this.liftClose = new GLTFShape('models/closedLiftToGame.glb')
    }
}

export class SceneAssets {
    higherTowerModel: GLTFShape
    higherTowerAnimStates: AnimationState[]
    gameStarter: GLTFShape
    gameStarterAnimStates: AnimationState[]
    globalScene: GLTFShape
    mobius: GLTFShape
    mobiusAnimStates: AnimationState[]
    rulesBtn: GLTFShape
    rulesBtnAnimStates: AnimationState[]
    playBtn: GLTFShape
    playBtnAnimStates: AnimationState[]
    soundClick: AudioSource
    soundValide: AudioSource
    soundTeleport: AudioSource
    soundLiftMove: AudioSource
    soundStartGame: AudioSource
    soundStopBlock: AudioSource
    soundStopBlockPerfect: AudioSource
    soundLooseLife: AudioSource
    soundLooseGame: AudioSource
    soundSpell: AudioSource

    constructor() {
        this.gameStarter = new GLTFShape('models/liftToGameBase.glb')
        this.gameStarterAnimStates = [
            new AnimationState('leftFront_anim', { layer: 0 }),
            new AnimationState('leftTop_anim', { layer: 1 }),
            new AnimationState('rightFront_anim', { layer: 2 }),
            new AnimationState('rightTop_anim', { layer: 3 }),
        ]
        this.higherTowerModel = new GLTFShape('models/HigherTower.glb')
        this.higherTowerAnimStates = [
            new AnimationState('tower_anim', { layer: 0 }),
            new AnimationState('under_anim', { layer: 1 }),
            new AnimationState('base_anim', { layer: 2 }),
        ]
        this.globalScene = new GLTFShape('models/globalScene.glb')
        this.mobius = new GLTFShape('models/Mobius.glb')
        this.mobiusAnimStates = [
            new AnimationState('mobius_anim_0', { layer: 0 }),
            new AnimationState('mobius_anim_1', { layer: 1 }),
        ]

        this.rulesBtn = new GLTFShape('models/rules.glb')
        this.rulesBtnAnimStates = [
            new AnimationState('rotationXBezier', { layer: 0 }),
            new AnimationState('rotationYBezier', { layer: 1 }),
            new AnimationState('rotationZBezier', { layer: 2 }),
            new AnimationState('rotationXLinear', { layer: 3 }),
            new AnimationState('rotationYLinear', { layer: 4 }),
            new AnimationState('rotationZLinear', { layer: 5 }),
            new AnimationState('rotationBorderXBezier', { layer: 6 }),
            new AnimationState('rotationBorderYBezier', { layer: 7 }),
            new AnimationState('rotationBorderZBezier', { layer: 8 }),
            new AnimationState('rotationBorderXLinear', { layer: 9 }),
            new AnimationState('rotationBorderYLinear', { layer: 10 }),
            new AnimationState('rotationBorderZLinear', { layer: 11 }),

            new AnimationState('viberXBezier', { layer: 12, speed: 5 }),
            new AnimationState('viberYBezier', { layer: 13, speed: 5 }),
            new AnimationState('viberZBezier', { layer: 14, speed: 5 }),
            new AnimationState('viberXLinear', { layer: 15, speed: 5 }),
            new AnimationState('viberYLinear', { layer: 16, speed: 5 }),
            new AnimationState('viberZLinear', { layer: 17, speed: 5 }),
            new AnimationState('viberBorderXBezier', { layer: 18, speed: 5 }),
            new AnimationState('viberBorderYBezier', { layer: 19, speed: 5 }),
            new AnimationState('viberBorderZBezier', { layer: 20, speed: 5 }),
            new AnimationState('viberBorderXLinear', { layer: 21, speed: 5 }),
            new AnimationState('viberBorderYLinear', { layer: 22, speed: 5 }),
            new AnimationState('viberBorderZLinear', { layer: 23, speed: 5 }),
        ]
        this.playBtn = new GLTFShape('models/play.glb')
        this.playBtnAnimStates = [
            new AnimationState('rotationXBezier', { layer: 0 }),
            new AnimationState('rotationYBezier', { layer: 1 }),
            new AnimationState('rotationZBezier', { layer: 2 }),
            new AnimationState('rotationXLinear', { layer: 3 }),
            new AnimationState('rotationYLinear', { layer: 4 }),
            new AnimationState('rotationZLinear', { layer: 5 }),
            new AnimationState('rotationBorderXBezier', { layer: 6 }),
            new AnimationState('rotationBorderYBezier', { layer: 7 }),
            new AnimationState('rotationBorderZBezier', { layer: 8 }),
            new AnimationState('rotationBorderXLinear', { layer: 9 }),
            new AnimationState('rotationBorderYLinear', { layer: 10 }),
            new AnimationState('rotationBorderZLinear', { layer: 11 }),

            new AnimationState('viberXBezier', { layer: 12, speed: 5 }),
            new AnimationState('viberYBezier', { layer: 13, speed: 5 }),
            new AnimationState('viberZBezier', { layer: 14, speed: 5 }),
            new AnimationState('viberXLinear', { layer: 15, speed: 5 }),
            new AnimationState('viberYLinear', { layer: 16, speed: 5 }),
            new AnimationState('viberZLinear', { layer: 17, speed: 5 }),
            new AnimationState('viberBorderXBezier', { layer: 18, speed: 5 }),
            new AnimationState('viberBorderYBezier', { layer: 19, speed: 5 }),
            new AnimationState('viberBorderZBezier', { layer: 20, speed: 5 }),
            new AnimationState('viberBorderXLinear', { layer: 21, speed: 5 }),
            new AnimationState('viberBorderYLinear', { layer: 22, speed: 5 }),
            new AnimationState('viberBorderZLinear', { layer: 23, speed: 5 }),
        ]

        this.soundClick = new AudioSource(new AudioClip("sounds/click.wav"))
        this.soundValide = new AudioSource(new AudioClip("sounds/valide.wav"))
        this.soundTeleport = new AudioSource(new AudioClip("sounds/liftTeleport.wav"))
        this.soundLiftMove = new AudioSource(new AudioClip("sounds/liftMove.wav"))
        this.soundStartGame = new AudioSource(new AudioClip("sounds/start.wav"))
        this.soundStopBlock = new AudioSource(new AudioClip("sounds/stopBlock.wav"))
        this.soundStopBlockPerfect = new AudioSource(new AudioClip("sounds/stopBlockPerfect.wav"))
        this.soundLooseLife = new AudioSource(new AudioClip("sounds/looseLife.wav"))
        this.soundLooseGame = new AudioSource(new AudioClip("sounds/looseGame.wav"))
        this.soundSpell = new AudioSource(new AudioClip("sounds/spell.wav"))
    }
}

export default { GameAssets, SceneAssets }
