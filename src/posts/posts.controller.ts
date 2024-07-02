import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UsePipes } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CustomValidationPipe } from 'src/assist/pipe/custom-validation.pipe';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post(':id')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(CustomValidationPipe)
  create(@Body() createPostDto: CreatePostDto, @Param('id') id: string) {
    return this.postsService.create(createPostDto, id);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.postsService.findOne(key);
  }

  @Patch(':key')
  update(@Param('key') key: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(key, updatePostDto);
  }

  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.postsService.remove(key);
  }
}
