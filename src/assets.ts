export class GameAssets {
    heartBase: GLTFShape
    heartOn: GLTFShape
    heartOff: GLTFShape
    numericalCounter: GLTFShape
    numericalCounterAnimStates: AnimationState[]

    constructor() {
        this.heartBase = new GLTFShape('models/HeartBase.glb')
        this.heartOn = new GLTFShape('models/HeartOn.glb')
        this.heartOff = new GLTFShape('models/HeartOff.glb')

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
    }
}

export default { GameAssets, SceneAssets }