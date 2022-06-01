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

    blockMaterials: Material[] = []
    glowMaterial: Material

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

        const material = new Material()
        material.albedoColor = Color3.Yellow()
        material.metallic = 0.0
        material.roughness = 1.0
        material.emissiveColor = new Color3(1.325, 1.125, 0.0)
        this.glowMaterial = material
    }
}

export class SceneAssets {
    higherTowerModel: GLTFShape
    higherTowerAnimStates: AnimationState[]

    constructor() {
        this.higherTowerModel = new GLTFShape('models/HigherTower.glb')
        this.higherTowerAnimStates = [
            new AnimationState('tower_anim', { layer: 0 }),
            new AnimationState('under_anim', { layer: 1 }),
            new AnimationState('base_anim', { layer: 2 })
        ]
    }

    // public getModel() { return this.higherTowerModel }
}

export default { GameAssets, SceneAssets }
