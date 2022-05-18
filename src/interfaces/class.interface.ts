import TowerBlock from "@/towerBlock";

export interface ITowerDuel {
    messageBus: MessageBus
    blockCount: number
    maxCount: number
    spawnInterval: Entity
    blocks: TowerBlock[]

    update?(dt: number): void
}
export interface ITowerBlock {
    TowerDuel: ITowerDuel
    entity: Entity
    isBase: Boolean
    scale: Vector3
    offsetY: number

    update?(dt: number): void
}
