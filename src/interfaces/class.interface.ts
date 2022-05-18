export interface ITowerDuel {
    messageBus: MessageBus
    blockCount: number

    update?(dt: number): void
}
