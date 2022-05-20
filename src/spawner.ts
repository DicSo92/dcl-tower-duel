import { FollowCurvedPathComponent, ToggleComponent, ToggleState } from "@dcl/ecs-scene-utils";
import { ITowerDuel } from "@/interfaces/class.interface";

export default class Spawner implements ISystem {
    physicsMaterial: CANNON.Material
    world: CANNON.World
    TowerDuel: ITowerDuel
    entity: Entity
    moveDuration: number = 10

    constructor(cannonMaterial: CANNON.Material, world: CANNON.World, towerDuel: ITowerDuel) {
        this.physicsMaterial = cannonMaterial
        this.world = world
        this.TowerDuel = towerDuel

        this.entity = new Entity();
        this.Init();
    }

    Init = () => {
        this.BuildSpawner()
        this.entity.getComponent(ToggleComponent).toggle()
        engine.addEntity(this.entity)
    };

    private BuildSpawner() {
        this.entity.addComponent(new BoxShape())
        this.entity.addComponent(new Transform({ scale: new Vector3(1, 1, 1) }))

        //Define the positions of the path for move animation
        let path = [
            new Vector3(29, 2, 1),
            new Vector3(31, 2, 3),
            new Vector3(31, 2, 13),
            new Vector3(29, 2, 15),
            new Vector3(19, 2, 15),
            new Vector3(17, 2, 13),
            new Vector3(17, 2, 3),
            new Vector3(19, 2, 1),
        ]
        // Move entity infinitely
        this.entity.addComponent(new ToggleComponent(ToggleState.Off,(value: ToggleState) => {
            this.entity.addComponentOrReplace(
                this.entity.addComponent(new FollowCurvedPathComponent(path, this.moveDuration, 25, true, true, () => {
                    log('curve finished')
                    this.entity.getComponent(ToggleComponent).toggle()
                }))
            )})
        )
    }

    update(dt: number) {
        // log("Update", dt)
    }
}
