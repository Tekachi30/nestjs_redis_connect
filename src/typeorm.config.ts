//typeorm.config.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/entities/user.entity'
import { Grade } from './grades/entities/grade.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          type: 'mssql',
          // host: configService.get<string>('MSSQL_SERVER', 'localhost'),
          // port: parseInt(configService.get<string>('MSSQL_PORT', '1433'), 10),
          // username: configService.get<string>('MSSQL_USER', 'root'),
          // password: configService.get<string>('MSSQL_PASSWORD', ''),
          // database: configService.get<string>('MSSQL_DB_NAME', 'DB_NestRedis'),
          host: configService.get<string>('MSSQL_SERVER', 'localhost'),
          port: 1433,
          username: 'dev',
          password: 'dev',
          database: 'DB_NestRedis',
          entities: [User,Grade],
          // autoLoadEntities: true,
          synchronize: false, 
          // migrations: ['dist/migrations/*.js'],
          // cli: {
          //   migrationsDir: 'src/migrations',
          // },
          options: {
            encrypt: true,
            trustServerCertificate: true,
          },
        }),
        inject: [ConfigService],
      }),
  ],
})
export class CustomTypeOrmModule {}