//users.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisService } from '../redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class UsersService {
  constructor(
    private readonly redisService: RedisService,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const key = createUserDto.name;
      const existingUser = await this.redisService.get(`User:${key}`);
      if (existingUser) {
        return {
          statusCode: 400, 
          message: 'Tên người dùng đã tồn tại'
        };
      } else {
        // thêm vào SQL Sever và Redis
        const savedUser = await this.userRepository.save(createUserDto);
        const userData = JSON.stringify({id: savedUser.id, ...createUserDto});
        const ttl = 3600;
        await this.redisService.set(`User:${key}`, userData, ttl);
        return {
          statusCode: 201, 
          message: 'thêm thành công'
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 404, 
        message: 'ta đã thấy lỗi fix đê'
      };
    }
  }

  async findAll() {
    try {
      const keys = await this.redisService.getAllKeys('User:*');
      const users = [];
  
      if (!keys || keys.length === 0) {
        // Không tìm thấy user nào trên Redis, lấy tất cả user từ database
        const dbUsers = await this.userRepository.find();
        if (dbUsers.length === 0) {
          return {
            statusCode: 400, 
            message: 'không tìm thấy user nào'
          };
        }
  
        // Đẩy các user từ database lên Redis
        for (const dbUser of dbUsers) {
          const redisKey = `User:${dbUser.name}`;
          await this.redisService.set(redisKey, JSON.stringify(dbUser), 3600);
          users.push(dbUser);
        }
  
        return users;
      } else {
        for (const key of keys) {
          const userData = await this.redisService.get(key);
          if (userData) {
            users.push(JSON.parse(userData));
          }
        }
  
        // Kiểm tra trong database để tìm user không có trong Redis
        const dbUsers = await this.userRepository.find();
        for (const dbUser of dbUsers) {
          const userInRedis = users.find(user => user.id === dbUser.id);
          if (!userInRedis) {
            // Đẩy user từ database lên Redis
            const redisKey = `User:${dbUser.name}`;
            await this.redisService.set(redisKey, JSON.stringify(dbUser), 3600);
            users.push(dbUser);
          }
        }
  
        return users;
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 404, 
        message: 'ta đã thấy lỗi fix đê'
      };
    }
  }

  async findOne(key: string) {
    // tìm 1 user
    try {
      const data = await this.redisService.get(key);
      if (data) {
        return JSON.parse(data);
      } else {
        // Nếu không tìm thấy trong Redis, tìm user trong database
        const dbData = await this.userRepository.findOneBy({ name: key });
        if (dbData) {
          const userData = JSON.stringify(dbData);
          const ttl = 3600;
          // Đẩy dữ liệu từ database lên Redis
          await this.redisService.set(`User:${key}`, userData, ttl);
          return dbData;
        } else {
          return {
            statusCode: 400, 
            message: 'Không tìm thấy user'
          };
        }
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 404, 
        message: 'ta đã thấy lỗi fix đê'
      };
    }
  }

  async update(name: string, updateUserDto: UpdateUserDto) {
    try {
      const existingUser = await this.redisService.get(`User:${name}`);
      if (!existingUser) {
        return {
          statusCode: 400, 
          message: `Không tìm thấy user ${name}`
        };
      } else {
        const parsedUser = JSON.parse(existingUser);
        // Kiểm tra nếu tên mới trùng với tên người dùng khác
        if (updateUserDto.name && updateUserDto.name !== name) {
          const newNameUser = await this.redisService.get(
            `User:${updateUserDto.name}`,
          );
          if (newNameUser) {
            return {
              statusCode: 400, 
              message: 'Tên người dùng đã tồn tại'
            };
          } else {
            // Nếu tên mới khác tên cũ, xóa dữ liệu cũ và thêm dữ liệu mới trong Redis
            await this.redisService.del(`User:${name}`);
          }
        } else {
          // Cập nhật thông tin người dùng trong Redis với tên hiện tại
          await this.redisService.del(`User:${name}`);
        }

        // Cập nhật thông tin người dùng trong database
        await this.userRepository.update(parsedUser.id, updateUserDto);

        return {
          statusCode: 201, 
          message: `Đã cập nhật user ${name}`
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 404, 
        message: 'ta đã thấy lỗi fix đê'
      };
    }
  }

  async remove(key: string) {
    try {
      const data = await this.redisService.get(`User:${key}`);
      const parsedUser = JSON.parse(data);
      if (data) {
        await this.redisService.del(`User:${key}`); // Xóa 1 key
        await this.userRepository.delete(parsedUser);
        return {
          statusCode: 204, 
          message: `Đã xóa user ${key}`
        };
      } else {
        return `Không tìm thấy user ${key}`;
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 404, 
        message: 'ta đã thấy lỗi fix đê'
      };
    }
  }

  async removeAll() {
    try {
      const keys = await this.redisService.getAllKeys('User:*'); // Lấy danh sách tất cả keys
      if (keys.length === 0) {
        return {
          statusCode: 400, 
          message: 'Không tìm thấy key nào'
        };
      } else {
        const userKeys = keys.filter((key) => key.startsWith('User:')); // Lọc ra các keys trong thư mục user
        for (const key of userKeys) {
          await this.redisService.del(key); // Xóa key trong redis
        }
        // Xóa tất cả các bản ghi user trong cơ sở dữ liệu
        await this.userRepository.clear();
        return {
          statusCode: 204, 
          message: 'Các keys trong thư mục "user" đã được xóa'
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 404, 
        message: 'ta đã thấy lỗi fix đê'
      };
    }
  }
}
