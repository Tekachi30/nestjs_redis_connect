//users.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisService } from '../redis/redis.service';
@Injectable()
export class UsersService {
  constructor(private readonly redisService: RedisService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const key = createUserDto.name;
      const existingUser = await this.redisService.get(key);
      if (existingUser) {
        return 'Tên người dùng đã tồn tại';
      } else {
        const userData = JSON.stringify(createUserDto);
        const ttl = 3600;
        await this.redisService.set(key, userData, ttl);
        return 'thêm thành công';
      }
    } catch (error) {
      console.log(error);
      return 'ta đã thấy lỗi fix đê';
    }
  }

  async findAll() {
    try {
      const datas = await this.redisService.getAllKeys();
      const users = [];
      if (!datas || datas.length === 0) {
        return 'không tìm thấy user nào';
      } else {
        for (const data of datas) {
          const userData = await this.redisService.get(data);
          if (userData) {
            users.push(JSON.parse(userData));
          }
        }
        return users;
      }
    } catch (error) {
      console.log(error);
      return 'ta đã thấy lỗi fix đê';
    }
  }

  async findOne(name: string) {
    // tìm 1 user
    try {
      const key = name;
      const data = await this.redisService.get(key);
      if (data) {
        return JSON.parse(data);
      } else {
        return 'không tìm thấy user';
      }
    } catch (error) {
      console.log(error);
      return 'ta đã thấy lỗi fix đê';
    }
  }

  async update(name: string, updateUserDto: UpdateUserDto) {
    try {
      const existingUser = await this.redisService.get(name);
      if (!existingUser) {
        return `Không tìm thấy user ${name}`;
      } else {
        const updatedUser = { ...JSON.parse(existingUser), ...updateUserDto };

        // Kiểm tra nếu tên mới trùng với tên người dùng khác
        if (updateUserDto.name && updateUserDto.name !== name) {
          const newNameUser = await this.redisService.get(updateUserDto.name);
          if (newNameUser) {
            return 'Tên người dùng đã tồn tại';
          }
        } else {
          // Cập nhật thông tin người dùng
          const userData = JSON.stringify(updatedUser);
          const ttl = 3600;

          // Nếu tên mới khác tên cũ, xóa dữ liệu cũ và thêm dữ liệu mới
          if (updateUserDto.name && updateUserDto.name !== name) {
            await this.redisService.del(name);
            await this.redisService.set(updateUserDto.name, userData, ttl);
          } else {
            await this.redisService.set(name, userData, ttl);
          }
          return `Đã cập nhật user ${name}`;
        }
      }
    } catch (error) {
      console.log(error);
      return 'ta đã thấy lỗi fix đê';
    }
  }

  async remove(key: string) {
    try {
      const data = await this.redisService.get(key);
      if (data) {
        await this.redisService.del(key); // Xóa 1 key
        return `Đã xóa user ${key}`;
      } else {
        return `Không tìm thấy user ${key}`;
      }
    } catch (error) {
      console.log(error);
      return 'ta đã thấy lỗi fix đê';
    }
  }

  async removeAll() {
    try {
      await this.redisService.flushall(); // Xóa tất cả các key
      return 'Tất cả các key đã được xóa';
    } catch (error) {
      console.log(error);
      return 'ta đã thấy lỗi fix đê';
    }
  }
}
