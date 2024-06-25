# Demo Nestjs và Redis và MYSQLSERVER

## Lệnh tạo model:
- nest g resource ???

## Migrations SQL Server
1. npm i mssql typeorm 
2. npm i --save-dev ts-node tsconfig-paths
3. Tạo file typeorm.config.ts và cấu hình (Mẫu: https://github.com/Tekachi30/nestjs_redis_connect/blob/master/src/typeorm.config.ts)
4. Tạo các Migrations ./src/migrations/(Tên table muốn tạo)
5. Cấu hình Entity và các migration trong file Migration cho đồng bộ (Mẫu: https://github.com/Tekachi30/nestjs_redis_connect/tree/master/src)
6. Thêm 3 đoạn này vào phần scripts trong file package.json
```
    "build": "nest build && cp -R src/migrations dist/migrations",
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
    "migration:generate": "npm run build && npm run typeorm -- migration:generate -n",
    "migration:run": "npm run build && npm run typeorm -- migration:run"
```
7. 
