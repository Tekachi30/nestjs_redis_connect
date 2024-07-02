//users.service.ts
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisService } from '../redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { PostsService } from 'src/posts/posts.service';
import { ImgPostService } from 'src/img_post/img_post.service';
import { v2 as cloudinary } from 'cloudinary';
@Injectable()
export class UsersService {
  constructor(
    private readonly redisService: RedisService,

    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,

    @Inject(forwardRef(() => ImgPostService))
    private readonly img_postService: ImgPostService,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const key = createUserDto.name;
      const existingUser = await this.redisService.get(`User:${key}`);
      const existingUserDB = await this.userRepository.findOne({
        where: { name: key },
      });
      if (existingUser || existingUserDB) {
        return {
          statusCode: 400,
          message: 'Tên người dùng đã tồn tại',
        };
      } else {
        // thêm vào SQL Sever và Redis
        const savedUser = await this.userRepository.save(createUserDto);
        const userData = JSON.stringify({ id: savedUser.id, ...createUserDto });
        const ttl = 3600;
        await this.redisService.set(`User:${key}`, userData, ttl);
        return {
          statusCode: 201,
          message: 'thêm thành công',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 404,
        message: 'ta đã thấy lỗi fix đê',
      };
    }
  }

  async findAll() {
    try {
      // Lấy tất cả các key liên quan đến User từ Redis
      const keys = await this.redisService.getAllKeys('User:*');
      const users = [];

      // Lấy dữ liệu từ Redis cho các key này
      if (keys && keys.length > 0) {
        for (const key of keys) {
          const userData = await this.redisService.get(key);
          if (userData) {
            users.push(JSON.parse(userData));
          }
        }
      }

      // Lấy tất cả người dùng từ database
      const dbUsers = await this.userRepository.find({ relations: ['posts'] });
      if (dbUsers.length === 0) {
        return {
          statusCode: 400,
          message: 'không tìm thấy user nào',
        };
      }

      // Đẩy các user từ database lên Redis nếu chưa có trong Redis
      for (const dbUser of dbUsers) {
        const userInRedis = users.find((user) => user.id === dbUser.id);
        if (!userInRedis) {
          const db = JSON.stringify(dbUser);
          await this.redisService.set(`User:${dbUser.name}`, db, 3600);
          users.push(dbUser);
        }
      }

      return users;
    } catch (error) {
      console.log(error);
      return {
        statusCode: error.statusCode,
        message: 'ta đã thấy lỗi fix đê',
      };
    }
  }

  async findOneByID(id: string) {
    const check_user = await this.userRepository.findOneBy({ id: id });
    return check_user;
  }

  async findOne(key: string) {
    // tìm 1 user
    try {
      const data = await this.redisService.get(key);
      if (data) {
        return JSON.parse(data);
      } else {
        // Nếu không tìm thấy trong Redis, tìm user trong database
        const dbData = await this.userRepository.findOne({
          where: { name: key },
          relations: ['posts'],
        });
        if (dbData) {
          const userData = JSON.stringify(dbData);
          const ttl = 3600;
          // Đẩy dữ liệu từ database lên Redis
          await this.redisService.set(`User:${key}`, userData, ttl);
          return dbData;
        } else {
          return {
            statusCode: 400,
            message: 'Không tìm thấy user',
          };
        }
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 404,
        message: 'ta đã thấy lỗi fix đê',
      };
    }
  }

  async update(name: string, updateUserDto: UpdateUserDto) {
    try {
      const existingUser = await this.redisService.get(`User:${name}`);
      const existingUserDB = await this.userRepository.findOne({
        where: { name: updateUserDto.name },
      });
      if (!existingUser || !existingUserDB) {
        return {
          statusCode: 400,
          message: `Không tìm thấy user ${name}`,
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
              message: 'Tên người dùng đã tồn tại',
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
          message: `Đã cập nhật user ${name}`,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 404,
        message: 'ta đã thấy lỗi fix đê',
      };
    }
  }

  async remove(key: string) {
    try {
      const data = await this.redisService.get(`User:${key}`);
      const parsedUser = JSON.parse(data) as User;
      if (data) {
        // xóa các post liên quan với user bị xóa
        const check_posts = await this.postsService.findAllByUser(
          parsedUser.id,
        );
        if (check_posts.length > 0) {
          for (const post of check_posts) {
            await this.postsService.remove(post.title);
          }
        }

        await this.redisService.del(`User:${key}`); // Xóa 1 key
        await this.userRepository.delete(parsedUser.id);
        return {
          statusCode: 204,
          message: `Đã xóa user ${key}`,
        };
      } else {
        return `Không tìm thấy user ${key}`;
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 404,
        message: 'ta đã thấy lỗi fix đê',
      };
    }
  }

  async removeAll() {
    try {
      const keys = await this.redisService.getAllKeys('User:*'); // Lấy danh sách tất cả keys
      if (keys.length === 0) {
        return {
          statusCode: 400,
          message: 'Không tìm thấy key nào',
        };
      } else {
        const userKeys = keys.filter((key) => key.startsWith('User:')); // Lọc ra các keys trong thư mục user
        for (const key of userKeys) {
          const data = await this.redisService.get(key);
          const parsedUser = JSON.parse(data) as User;

          if (data) {
            // Xóa các bài viết liên quan đến người dùng
            // xóa các post liên quan với user bị xóa
            const check_posts = await this.postsService.findAllByUser(
              parsedUser.id,
            );
            if (check_posts.length > 0) {
              for (const post of check_posts) {
                await this.postsService.remove(post.title);
              }
            }

            await this.redisService.del(key); // Xóa key người dùng trong Redis
            await this.userRepository.delete(parsedUser.id); // Xóa người dùng trong cơ sở dữ liệu
          }
        }
        return {
          statusCode: 204,
          message: 'Các keys trong thư mục "user" đã được xóa',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 404,
        message: 'ta đã thấy lỗi fix đê',
      };
    }
  }
}
