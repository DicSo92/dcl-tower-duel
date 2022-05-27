export default class Assets {
    heartBase: GLTFShape
    heartOn: GLTFShape
    heartOff: GLTFShape

    constructor() {
        this.heartBase = new GLTFShape('models/HeartBase.glb')
        this.heartOn =  new GLTFShape('models/HeartOn.glb')
        this.heartOff =  new GLTFShape('models/HeartOff.glb')
    }
}
