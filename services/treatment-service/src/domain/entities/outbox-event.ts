export class OutboxEvent {
  constructor(
    public readonly id: string,
    public readonly eventType: string,
    public readonly payload: Record<string, unknown>,
    public readonly published: boolean,
    public readonly createdAt: Date,
  ) {}
}
