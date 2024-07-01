import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { RedisService } from 'src/redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { ImgPostService } from 'src/img_post/img_post.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly redisService: RedisService,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ImgPostService))
    private readonly img_postService: ImgPostService,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}
  async create(createPostDto: CreatePostDto, id: number) {
    try {
      const key = createPostDto.title;
      // Kiểm tra tiêu đề đã tồn tại trong Redis chưa
      const existingPost = await this.redisService.get(`Post:${key}`);
      const existingPostDB = await this.postRepository.findOne({
        where: { title: key },
      });
      if (existingPost || existingPostDB) {
        return {
          statusCode: 400,
          message: 'Tiêu đề đã tồn tại',
        };
      }
      // Kiểm tra user có tồn tại không
      const checkUser = await this.usersService.findOneByID(id);
      if (!checkUser) {
        return {
          statusCode: 400,
          message: 'Không tìm thấy user',
        };
      }
      // Thêm user vào createPostDto
      createPostDto.user = checkUser;
      // Lưu bài viết vào SQL Server
      const savedPost = await this.postRepository.save(createPostDto);
      // Chuyển dữ liệu bài viết thành JSON và lưu vào Redis
      const postData = JSON.stringify({ id: savedPost.id, ...createPostDto });
      const ttl = 3600;
      await this.redisService.set(`Post:${key}`, postData, ttl);
      return {
        statusCode: 201,
        message: 'Thêm thành công',
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: error.statusCode,
        message: 'ta đã thấy lỗi fix đê',
      };
    }
  }

  async findAll() {
    try {
      const keys = await this.redisService.getAllKeys('Post:*');
      const posts = [];
      if (!keys || keys.length === 0) {
        // Không tìm thấy post nào trên Redis, lấy tất cả post từ database
        const dbPosts = await this.postRepository.find({ relations: ['user'] });
        if (dbPosts.length === 0) {
          return {
            statusCode: 400,
            message: 'không tìm thấy post nào',
          };
        }
        // Đẩy các post từ database lên Redis
        for (const dbPost of dbPosts) {
          const redisKey = `Post:${dbPost.title}`;
          await this.redisService.set(redisKey, JSON.stringify(dbPost), 3600);
          posts.push(dbPost);
        }

        return posts;
      } else {
        for (const key of keys) {
          const postData = await this.redisService.get(key);
          if (postData) {
            posts.push(JSON.parse(postData));
          }
        }
        // Kiểm tra trong database để tìm post không có trong Redis
        const dbPosts = await this.postRepository.find({ relations: ['user'] });
        for (const dbPost of dbPosts) {
          const postInRedis = posts.find((post) => post.id === dbPost.id);
          if (!postInRedis) {
            // Đẩy post từ database lên Redis
            const redisKey = `Post:${dbPost.title}`;
            await this.redisService.set(redisKey, JSON.stringify(dbPost), 3600);
            posts.push(dbPost);
          }
        }
        return posts;
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: error.statusCode,
        message: 'ta đã thấy lỗi fix đê',
      };
    }
  }

  async findOne(key: string) {
    try {
      const data = await this.redisService.get(key);
      if (data) {
        return JSON.parse(data);
      } else {
        // Nếu không tìm thấy trong Redis, tìm post trong database
        const dbData = await this.postRepository.findOne({
          where: { title: key },
          relations: ['user'],
        });
        if (dbData) {
          const postData = JSON.stringify(dbData);
          const ttl = 3600;
          // Đẩy dữ liệu từ database lên Redis
          await this.redisService.set(`Post:${key}`, postData, ttl);
          return dbData;
        } else {
          return {
            statusCode: 400,
            message: 'Không tìm thấy post',
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

  async findOneByID(id: number) {
    const check_user = await this.postRepository.findOneBy({ id: id });
    return check_user;
  }

  async update(key: string, updatePostDto: UpdatePostDto) {
    try {
      const existingPost = await this.redisService.get(`Post:${key}`);
      if (!existingPost) {
        return {
          statusCode: 400,
          message: `Không tìm thấy post ${key}`,
        };
      } else {
        const parsedPost = JSON.parse(existingPost);
        // Kiểm tra nếu tên mới trùng với tên post khác
        if (updatePostDto.title && updatePostDto.title !== key) {
          const newTitleUser = await this.redisService.get(
            `Post:${updatePostDto.title}`,
          );
          const existingPostDB = await this.postRepository.findOne({
            where: { title: updatePostDto.title },
          });
          if (newTitleUser || existingPostDB) {
            return {
              statusCode: 400,
              message: 'Tiêu đề đã tồn tại',
            };
          } else {
            // Nếu tên mới khác tên cũ, xóa dữ liệu cũ và thêm dữ liệu mới trong Redis
            await this.redisService.del(`Post:${key}`);
          }
        } else {
          // Cập nhật thông tin post trong Redis với tên hiện tại
          await this.redisService.del(`Post:${key}`);
        }
        // Cập nhật thông tin post trong database
        await this.postRepository.update(parsedPost.id, updatePostDto);

        return {
          statusCode: 201,
          message: `Đã cập nhật post ${key}`,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: error.statusCode,
        message: `Đã cập nhật post ${key}`,
      };
    }
  }

  async remove(key: string) {
    try {
      const data = await this.redisService.get(`Post:${key}`);
      const parsedPost = JSON.parse(data);
      if (data) {
        await this.redisService.del(`Post:${key}`); // Xóa 1 key
        await this.postRepository.delete(parsedPost);
        return {
          statusCode: 204,
          message: `Đã xóa post ${key}`,
        };
      } else {
        return `Không tìm thấy post ${key}`;
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 404,
        message: 'ta đã thấy lỗi fix đê',
      };
    }
  }

  async deletePostsByUser(user: User) {
    try {
      const posts = await this.postRepository.find({ where: { user: user } });
      for (const post of posts) {
        await this.img_postService.deletePostsByPost(post); // xóa tất cả ảnh của post
        await this.redisService.del(`Post:${post.title}`); // Xóa key trong Redis
        await this.postRepository.delete(post); // Xóa bài viết trong cơ sở dữ liệu
      }
    } catch (error) {
      console.log(error);
    }
  }
}
