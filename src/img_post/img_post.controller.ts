import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ImgPostService } from './img_post.service';
import { CreateImgPostDto } from './dto/create-img_post.dto';
import { UpdateImgPostDto } from './dto/update-img_post.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('img-post')
export class ImgPostController {
  constructor(private readonly imgPostService: ImgPostService) {}

  @Post(':id')
  @UseInterceptors(FileInterceptor('file')) // biến truyền vào
  create(
    @Body() createImgPostDto: CreateImgPostDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    return this.imgPostService.create(createImgPostDto, file, id);
  }

  @Get()
  findAll() {
    return this.imgPostService.findAll();
  }

  // @Get(':id')
  // findAll(@Param('id') id: string) {
  //   return this.imgPostService.findAllImgByPost();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imgPostService.findOne(+id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateImgPostDto: UpdateImgPostDto) {
    return this.imgPostService.update(+id, updateImgPostDto);
  }

  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.imgPostService.remove(key);
  }
}
