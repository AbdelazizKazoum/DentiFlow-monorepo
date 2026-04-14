import {DynamicModule, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigService} from "@nestjs/config";
import {typeormOptionsFactory} from "./typeorm.factory";

/**
 * DatabaseModule — registers the TypeORM DataSource for a service.
 *
 * Usage in service AppModule:
 *   DatabaseModule.forRoot()
 *
 * ConfigService is resolved automatically by IoC from the globally
 * registered ConfigModule (must be first import in AppModule).
 */
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: typeormOptionsFactory,
          inject: [ConfigService],
        }),
      ],
    };
  }
}
