import {Module} from "@nestjs/common";
import {AppointmentGrpcClientModule} from "../../infrastructure/grpc/appointment-grpc-client.module";
import {RolesGuard} from "../../shared/guards/roles.guard";
import {ClinicScopeGuard} from "../../shared/guards/clinic-scope.guard";
import {AppointmentController} from "./appointment.controller";
import {QueueController} from "./queue.controller";

@Module({
  imports: [AppointmentGrpcClientModule],
  controllers: [AppointmentController, QueueController],
  providers: [RolesGuard, ClinicScopeGuard],
})
export class AppointmentModule {}
