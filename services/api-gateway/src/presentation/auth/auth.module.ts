import {Module} from "@nestjs/common";
import {AdminAuthController} from "./admin-auth.controller";
import {AuthGrpcClientModule} from "../../infrastructure/grpc/auth-grpc-client.module";

@Module({
  imports: [AuthGrpcClientModule],
  controllers: [AdminAuthController],
})
export class AuthModule {}
