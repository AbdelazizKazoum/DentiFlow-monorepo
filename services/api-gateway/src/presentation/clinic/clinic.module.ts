import {Module} from "@nestjs/common";
import {ClinicController} from "./clinic.controller";
import {ClinicGrpcClientModule} from "../../infrastructure/grpc/clinic-grpc-client.module";
import {RolesGuard} from "../../shared/guards/roles.guard";
import {ClinicScopeGuard} from "../../shared/guards/clinic-scope.guard";

@Module({
  imports: [ClinicGrpcClientModule],
  controllers: [ClinicController],
  providers: [RolesGuard, ClinicScopeGuard],
})
export class ClinicModule {}
