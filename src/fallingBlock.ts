const THROW_STRENGTH_MULTIPLIER = 0.125

export class FallingBlock extends Entity {
    public isActive: boolean = false
    public isThrown: boolean = true
    public body: CANNON.Body
    public world: CANNON.World

    constructor(transform: Transform, cannonMaterial: CANNON.Material, cannonWorld: CANNON.World) {
        super()
        engine.addEntity(this)

        this.addComponent(new BoxShape())
        this.addComponent(transform)
        this.world = cannonWorld

        // Create physics body for block
        this.body = new CANNON.Body({
            mass: 1, // kg
            position: new CANNON.Vec3(transform.position.x, transform.position.y, transform.position.z), // m
            shape: new CANNON.Box(new CANNON.Vec3(transform.scale.x, transform.scale.y, transform.scale.z))
        })

        // Add material and dampening to stop the ball rotating and moving continuously
        this.body.sleep()
        this.body.material = cannonMaterial
        this.body.linearDamping = 0.4
        this.body.angularDamping = 0.4
        this.world.addBody(this.body) // Add ball body to the world

        this.isActive = false
        this.isThrown = true
        this.setParent(null)

        // Physics
        this.body.wakeUp()
        this.body.velocity.setZero()
        this.body.angularVelocity.setZero()

        // this.body.position.set(
        //     Camera.instance.feetPosition.x + throwDirection.x,
        //     throwDirection.y + Camera.instance.position.y,
        //     Camera.instance.feetPosition.z + throwDirection.z
        // )

    }

    blockThrow(throwDirection: Vector3, throwPower: number): void {
        let throwPowerAdjusted = throwPower * THROW_STRENGTH_MULTIPLIER

        // Throw
        this.body.applyImpulse(
            new CANNON.Vec3(throwDirection.x * throwPowerAdjusted, throwDirection.y * throwPowerAdjusted, throwDirection.z * throwPowerAdjusted),
            new CANNON.Vec3(this.body.position.x, this.body.position.y, this.body.position.z)
        )
    }
}
