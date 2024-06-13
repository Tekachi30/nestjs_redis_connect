//users.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisService } from '../redis/redis.service';
@Injectable()
export class UsersService {
  constructor(private readonly redisService: RedisService) {}

  async create(createUserDto: CreateUserDto) {
    // return 'This action adds a new user';
    try {
      const key = createUserDto.name;
      const userData = JSON.stringify(createUserDto);
      const ttl = 180;
      await this.redisService.set(key,userData,ttl)
      return 'thêm thành công'
    } catch (error) {
      console.log(error); 
      return 'ta đã thấy lỗi fix đê'
    }
  }

  async findAll() {
    // return `This action returns all users`;
    try {
      const datas = await this.redisService.scanKeys('user:*');
      if(datas){
        const users = [];
        for (const data of datas) {
          const userData = await this.redisService.get(data);
          if (userData) {
            users.push(JSON.parse(userData));
          }
        }
        return users;
      }else{
        return 'không tìm thấy user nào'
      }
    } catch (error) {
      console.log(error); 
      return 'ta đã thấy lỗi fix đê'
    }
  }

  async findOne(name: string) { // tìm 1 user
    // return `This action returns a #${id} user`;
    try {
      const key = name;
      const data = await this.redisService.get(key);
      if(data){
        return JSON.parse(data);
      }else{
        return 'không tìm thấy user'
        
      }
    } catch (error) {
      console.log(error);
      return 'ta đã thấy lỗi fix đê'
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(key: string) {
    // return `This action removes a #${id} user`;
    try {
      await this.redisService.del(key); // Xóa 1 key
      return `Đã xóa user ${key}`;
    } catch (error) {
      console.log(error);
      return 'ta đã thấy lỗi fix đê'
    }
  }

  async removeAll(){
    try {
      console.log('bắt đầu xóa');
      await this.redisService.flushall(); // Xóa tất cả các key
      console.log('đã xóa hết thành công');
      return 'Tất cả các key đã được xóa';
    } catch (error) {
      console.log(error);
      return 'ta đã thấy lỗi fix đê'
    }
  }
}
