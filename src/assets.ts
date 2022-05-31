export class GameAssets {
    heartBase: GLTFShape
    heartOn: GLTFShape
    heartOff: GLTFShape
    numericalCounter: GLTFShape
    numericalCounterAnimStates: AnimationState[]
    liftOpen: GLTFShape
    liftClose: GLTFShape

    constructor() {
        this.heartBase = new GLTFShape('models/HeartBase.glb')
        this.heartOn = new GLTFShape('models/HeartOn.glb')
        this.heartOff = new GLTFShape('models/HeartOff.glb')
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
    }
}

export default { GameAssets, SceneAssets }