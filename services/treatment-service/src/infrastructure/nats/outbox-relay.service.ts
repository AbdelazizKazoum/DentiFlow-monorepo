import {Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {connect, NatsConnection} from "nats";
import {IOutboxRepository} from "../../domain/repositories/outbox-repository.interface";
import {OUTBOX_REPOSITORY} from "../../shared/constants/injection-tokens";

@Injectable()
export class OutboxRelayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayService.name);
  private connection?: NatsConnection;
  private interval?: NodeJS.Timeout;

  constructor(
    private readonly config: ConfigService,
    @Inject(OUTBOX_REPOSITORY) private readonly outbox: IOutboxRepository,
  ) {}

  async onModuleInit() {
    const url = this.config.get<string>("NATS_URL");
    if (!url) return;
    this.connection = await connect({servers: url});
    this.interval = setInterval(
      () => void this.publishPending(),
      this.config.get<number>("OUTBOX_RELAY_INTERVAL_MS", 500),
    );
  }

  async onModuleDestroy() {
    if (this.interval) clearInterval(this.interval);
    await this.connection?.drain();
  }

  private async publishPending() {
    if (!this.connection) return;
    const events = await this.outbox.findUnpublished(50);
    for (const event of events) {
      try {
        this.connection.publish(
          event.eventType,
          new TextEncoder().encode(JSON.stringify(event.payload)),
        );
        await this.outbox.markPublished(event.id);
      } catch (err) {
        this.logger.warn(`Failed to publish ${event.eventType}: ${String(err)}`);
      }
    }
  }
}
