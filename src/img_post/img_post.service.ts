// img_post.service.ts
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateImgPostDto } from './dto/create-img_post.dto';
import { UpdateImgPostDto } from './dto/update-img_post.dto';
import { CloudinaryResponse } from './cloudinary/cloudinary-response';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { ImgPost } from './entities/img_post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/redis/redis.service';
import { PostsService } from 'src/posts/posts.service';
import { Repository } from 'typeorm';
import { Post } from 'src/posts/entities/post.entity';

@Injectable()
export class ImgPostService {
  constructor(
    private readonly redisService: RedisService,

    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,

    @InjectRepository(ImgPost)
    private img_postRepository: Repository<ImgPost>,
  ) {}

  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async create(
    createImgPostDto: CreateImgPostDto,
    file: Express.Multer.File,
    id: string,
  ) {
    try {
      const add_img = await this.uploadFile(file);
      const post = await this.postsService.findOneByID(id);
      if (post) {
        createImgPostDto.img_public_key = add_img.public_id;
        createImgPostDto.img_url = add_img.url;
        createImgPostDto.post = post;
        const result = this.img_postRepository.create(createImgPostDto);
        const savedImgPost = await this.img_postRepository.save(result);
        const postData = JSON.stringify({
          id: savedImgPost.id,
          ...createImgPostDto,
        });
        const ttl = 3600;
        await this.redisService.set(
          `Img_post:${createImgPostDto.img_public_key}`,
          postData,
          ttl,
        );
        return {
          statusCode: 201,
          message: 'Thêm ảnh thành công',
        };
      } else {
        return {
          statusCode: 400,
          message: 'Không tìm thấy post',
        };
      }
    } catch (error) {
      console.log(error);
    }
  }

  async findAll() {
    try {
      const keys = await this.redisService.getAllKeys('Img_post:*');
      const posts = [];
      if (!keys || keys.length === 0) {
        // Không tìm thấy post nào trên Redis, lấy tất cả post từ database
        const dbImgPosts = await this.img_postRepository.find({
          relations: ['post'],
        });
        if (dbImgPosts.length === 0) {
          return {
            statusCode: 400,
            message: 'không tìm thấy ảnh nào',
          };
        }
        // Đẩy các post từ database lên Redis
        for (const dbImgPost of dbImgPosts) {
          const redisKey = `Img_post:${dbImgPost.img_public_key}`;
          await this.redisService.set(
            redisKey,
            JSON.stringify(dbImgPost),
            3600,
          );
          posts.push(dbImgPost);
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
        const dbImgPosts = await this.img_postRepository.find({
          relations: ['post'],
        });
        for (const dbImgPost of dbImgPosts) {
          const postInRedis = posts.find((post) => post.id === dbImgPost.id);
          if (!postInRedis) {
            // Đẩy post từ database lên Redis
            const redisKey = `Img_post:${dbImgPost.img_public_key}`;
            await this.redisService.set(
              redisKey,
              JSON.stringify(dbImgPost),
              3600,
            );
            posts.push(dbImgPost);
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

  async findAllImgByPost(id: string) {
    const result = await this.img_postRepository.find({
      relations: ['post'],
      where: { post: { id: id } },
    });
    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} imgPost`;
  }

  update(id: number, updateImgPostDto: UpdateImgPostDto) {
    return `This action updates a #${id} imgPost`;
  }

  async remove(key: string) {
    try {
      const data = await this.redisService.get(`Img_post:${key}`);
      const parsedImgPost = JSON.parse(data);
      if (data) {
        cloudinary.api
          .delete_resources([parsedImgPost.img_public_key], {
            type: 'upload',
            resource_type: 'image',
          })
          .then(console.log); // xóa trên cloud
        await this.redisService.del(`Img_post:${key}`); // Xóa 1 key
        await this.img_postRepository.delete(parsedImgPost.id);
        return {
          statusCode: 204,
          message: `Đã xóa post ${key}`,
        };
      } else {
        return `Không tìm thấy post ${key}`;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
