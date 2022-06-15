export function loadColliders(cannonWorld: CANNON.World, physicsMaterial: CANNON.Material): void {
    // Invisible walls
    const wallShape = new CANNON.Box(new CANNON.Vec3(16, 32, 1))
    const wallNorth = new CANNON.Body({
        mass: 0,
        shape: wallShape,
        position: new CANNON.Vec3(16, 0, 0)
    })
    cannonWorld.addBody(wallNorth)

    const wallSouth = new CANNON.Body({
        mass: 0,
        shape: wallShape,
        position: new CANNON.Vec3(16, 0, 16)
    })
    cannonWorld.addBody(wallSouth)

    const wallWest = new CANNON.Body({
        mass: 0,
        shape: wallShape,
        position: new CANNON.Vec3(16, 0, 16)
    })
    wallWest.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2)
    cannonWorld.addBody(wallWest)

    const wallEast = new CANNON.Body({
        mass: 0,
        shape: wallShape,
        position: new CANNON.Vec3(32, 0, 16)
    })
    wallEast.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2)
    cannonWorld.addBody(wallEast)


    // Left tower floor -----------------------------------------------------------------------------------------------
    // const floorCollider1 = new Entity()
    // floorCollider1.addComponent(new BoxShape())
    // floorCollider1.addComponent(new Transform({
    //     position: new Vector3(24, 1.3, 8),
    //     scale: new Vector3(5, 0.5, 5)
    // }))
    // engine.addEntity(floorCollider1)
    const body1 = new CANNON.Body({
        position: new CANNON.Vec3(8, 1.3, 8),
        shape: new CANNON.Box(new CANNON.Vec3(2.5, 0.25, 2.5))
    })
    cannonWorld.addBody(body1)


    // const floorCollider2 = new Entity()
    // floorCollider2.addComponent(new BoxShape())
    // floorCollider2.addComponent(new Transform({
    //     position: new Vector3(24, 0.9, 8),
    //     scale: new Vector3(6, 0.5, 6)
    // }))
    // engine.addEntity(floorCollider2)
    const body2 = new CANNON.Body({
        position: new CANNON.Vec3(8, 0.9, 8),
        shape: new CANNON.Box(new CANNON.Vec3(3, 0.25, 3))
    })
    cannonWorld.addBody(body2)


    // const floorCollider3 = new Entity()
    // floorCollider3.addComponent(new BoxShape())
    // floorCollider3.addComponent(new Transform({
    //     position: new Vector3(24, 0.6, 8),
    //     scale: new Vector3(7, 0.5, 7)
    // }))
    // engine.addEntity(floorCollider3)
    const body3 = new CANNON.Body({
        position: new CANNON.Vec3(8, 0.6, 8),
        shape: new CANNON.Box(new CANNON.Vec3(3.5, 0.25, 3.5))
    })
    cannonWorld.addBody(body3)

    // const floorCollider4 = new Entity()
    // floorCollider4.addComponent(new BoxShape())
    // floorCollider4.addComponent(new Transform({
    //     position: new Vector3(24, 0.3, 8),
    //     scale: new Vector3(8, 0.5, 8)
    // }))
    // engine.addEntity(floorCollider4)
    const body4 = new CANNON.Body({
        position: new CANNON.Vec3(8, 0.3, 8),
        shape: new CANNON.Box(new CANNON.Vec3(4, 0.25, 4))
    })
    cannonWorld.addBody(body4)

    // const floorCollider5 = new Entity()
    // floorCollider5.addComponent(new BoxShape())
    // floorCollider5.addComponent(new Transform({
    //     position: new Vector3(24, 0.2, 8),
    //     scale: new Vector3(14, 0.1, 14)
    // }))
    // engine.addEntity(floorCollider5)
    const body5 = new CANNON.Body({
        position: new CANNON.Vec3(8, 0.2, 8),
        shape: new CANNON.Box(new CANNON.Vec3(7, 0.05, 7))
    })
    cannonWorld.addBody(body5)


    // Right tower floor -----------------------------------------------------------------------------------------------
    const rbody1 = new CANNON.Body({
        position: new CANNON.Vec3(-8, 1.3, 8),
        shape: new CANNON.Box(new CANNON.Vec3(2.5, 0.25, 2.5))
    })
    cannonWorld.addBody(body1)

    const rbody2 = new CANNON.Body({
        position: new CANNON.Vec3(-8, 0.9, 8),
        shape: new CANNON.Box(new CANNON.Vec3(3, 0.25, 3))
    })
    cannonWorld.addBody(body2)


    const rbody3 = new CANNON.Body({
        position: new CANNON.Vec3(-8, 0.6, 8),
        shape: new CANNON.Box(new CANNON.Vec3(3.5, 0.25, 3.5))
    })
    cannonWorld.addBody(body3)

    const rbody4 = new CANNON.Body({
        position: new CANNON.Vec3(-8, 0.3, 8),
        shape: new CANNON.Box(new CANNON.Vec3(4, 0.25, 4))
    })
    cannonWorld.addBody(body4)

    const rbody5 = new CANNON.Body({
        position: new CANNON.Vec3(-8, 0.2, 8),
        shape: new CANNON.Box(new CANNON.Vec3(7, 0.05, 7))
    })
    cannonWorld.addBody(body5)
}
