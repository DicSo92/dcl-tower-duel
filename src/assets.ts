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
    heartBase: GLTFShape
    heartOn: GLTFShape
    heartOff: GLTFShape
    numericalCounter: GLTFShape
    numericalCounterAnimStates: AnimationState[]
    liftOpen: GLTFShape
    liftClose: GLTFShape

    blockMaterials: Material[] = []
    glowMaterial: Material
    noGlowMaterial: Material

    constructor() {
        this.heartBase = new GLTFShape('models/HeartBase.glb')
        this.heartOn = new GLTFShape('models/HeartOn.glb')
        this.heartOff = new GLTFShape('models/HeartOff.glb')

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

        this.numericalCounter = new GLTFShape('models/numericalCounter.glb')
        this.numericalCounterAnimStates = [
            new AnimationState('layer0_anim', { layer: 0 }),
            new AnimationState('layer1_anim', { layer: 1 }),
            new AnimationState('layer2_anim', { layer: 2 })
        ]
    }
}

export class SceneAssets {
    higherTowerModel: GLTFShape
    higherTowerAnimStates: AnimationState[]
    gameStarter: GLTFShape
    gameStarterAnimStates: AnimationState[]
    povFloor: GLTFShape
    mobius: GLTFShape
    mobiusAnimStates: AnimationState[]

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
        this.povFloor = new GLTFShape('models/povFloor.glb')
        this.mobius = new GLTFShape('models/Mobius.glb')
        this.mobiusAnimStates = [
            new AnimationState('mobius_anim_0', { layer: 0 }),
            new AnimationState('mobius_anim_1', { layer: 1 }),
        ]
    }
}

export default { GameAssets, SceneAssets }
