import {Global, Module} from "@nestjs/common";
import {QueueEventBroadcaster} from "./queue-event-broadcaster.service";

@Global()
@Module({
  providers: [QueueEventBroadcaster],
  exports: [QueueEventBroadcaster],
})
export class NatsModule {}
