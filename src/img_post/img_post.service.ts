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

  async create(createImgPostDto: CreateImgPostDto, file: Express.Multer.File, id: number) {
    try {
      const add_img = await this.uploadFile(file)
      const post = await this.postsService.findOneByID(id);
      if(post){
        createImgPostDto.img_public_key = add_img.public_id
        createImgPostDto.img_url = add_img.url
        createImgPostDto.post = post
        const result = this.img_postRepository.create(createImgPostDto)
        const savedImgPost = await this.img_postRepository.save(result)
        const postData = JSON.stringify({ id: savedImgPost.id, ...createImgPostDto });
        const ttl = 3600;
        await this.redisService.set(`Img_post:${createImgPostDto.img_url}`, postData, ttl);
        return {
          statusCode: 201,
          message: 'Thêm ảnh thành công',
        };
      }else{
        return {
          statusCode: 400,
          message: 'Không tìm thấy post',
        };
      }
    } catch (error) {
      console.log(error);
    }
  }

  findAll() {
    return `This action returns all imgPost`;
  }

  findOne(id: number) {
    return `This action returns a #${id} imgPost`;
  }

  update(id: number, updateImgPostDto: UpdateImgPostDto) {
    return `This action updates a #${id} imgPost`;
  }

  remove(id: number) {
    return `This action removes a #${id} imgPost`;
  }

  async deletePostsByPost(post: Post) {
    try {
      const img_posts = await this.img_postRepository.find({ where: { post: post } });
      if(img_posts){
        for (const img_post of img_posts) {
          cloudinary.api
          .delete_resources([img_post.img_public_key],
            { type: 'upload', resource_type: 'image' })
          .then(console.log); // xóa trên cloud
          await this.redisService.del(`Img_post:${img_post.img_url}`); // Xóa key trong Redis
          await this.img_postRepository.delete(post); // Xóa bài viết trong cơ sở dữ liệu
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}
