import {Module} from "@nestjs/common";
import {NatsModule} from "../../infrastructure/nats/nats.module";
import {SseController} from "./sse.controller";

@Module({
  imports: [NatsModule],
  controllers: [SseController],
})
export class SseModule {}
