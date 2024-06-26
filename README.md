# Demo Nestjs và Redis và MYSQLSERVER

## Lệnh tạo model:
- nest g resource ???

## Cài đặt nodemon:
1. Cài nodemon vào:
```
npm i nodemon
```
2. Tạo 2 file ngoài src
- nodemon-debug.json
```
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.spec.ts"],
  "exec": "node --inspect-brk -r ts-node/register -r tsconfig-paths/register src/main.ts"
}
```
- nodemon.json
```
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.spec.ts"],
  "exec": "ts-node -r tsconfig-paths/register src/main.ts"
}
```
3. Thay đổi trong file scripts:
```
"start": "nodemon"
```
4. Chạy lệnh: 
```
npm start
```

## Cấu hình nestjs SQL Server
1. npm i mssql typeorm 
2. npm i --save-dev ts-node tsconfig-paths
3. Tạo file typeorm.config.ts và cấu hình (Mẫu: https://github.com/Tekachi30/nestjs_redis_connect/blob/master/src/typeorm.config.ts)
4. Set up các entity trong các model
- Mẫu:
```
// .src/users/entities/user.entity.ts
import { Post } from "src/posts/entities/post.entity";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm"

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: true })
    age: number;

    @Column({ nullable: true })
    info: string

    @OneToMany(() => Post, post => post.user)
    posts: Post[];
}
```
5. Trong file typeorm.config.ts 
```
synchronize: false // chỉ chạy 1 lần khi để true 
```
6. chạy lệnh:
```
npm start
```

## Cấu hình redis:
1. Cài đặt redis:
```
npm i ioredis
```
2. Tạo 2 file:
```
nest g module redis

nest g service redis
```
3. Cấu hình trong 2 file
- redis.module.ts
```
@Module({
  imports: [ConfigModule],
  providers: [ConfigService, RedisService],
  exports: [RedisService],
})
export class RedisModule {}
```

- redis.service.ts
```
@Injectable()
export class RedisService {
  //khai báo
  private client: Redis;
  // cấu hình
  constructor(private configService: ConfigService) {
    this.client = new IORedis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 1),
    });
  }
}
// Tạo các api ở dưới đây
```
4. Chạy lệnh:
```
npm start
```
