export interface OutboxEventInput {
  eventType: string;
  payload: Record<string, unknown>;
}

export interface OutboxEvent extends OutboxEventInput {
  id: string;
  published: boolean;
  createdAt: Date;
}

export interface IOutboxRepository {
  add(event: OutboxEventInput): Promise<void>;
  findUnpublished(limit: number): Promise<OutboxEvent[]>;
  markPublished(id: string): Promise<void>;
}
