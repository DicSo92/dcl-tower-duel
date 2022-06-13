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
    gameStarter: GLTFShape
    gameStarterAnimStates: AnimationState[]
    globalScene: GLTFShape
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
        this.globalScene = new GLTFShape('models/globalScene.glb')

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
