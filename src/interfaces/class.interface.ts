import TowerBlock from "@/towerBlock";

export interface ITowerDuel {
    messageBus: MessageBus
    blockCount: number
    maxCount: number
    spawnInterval: Entity
    blocks: TowerBlock[]
    offsetY: number
    lastScale: Vector3
    lastPosition: Vector3

    update?(dt: number): void
}
export interface ITowerBlock {
    TowerDuel: ITowerDuel
    entity: Entity
    isBase: Boolean
    scale: Vector3
    position: Vector3

    update?(dt: number): void
}
