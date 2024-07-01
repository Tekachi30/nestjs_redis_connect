import { PartialType } from '@nestjs/mapped-types';
import { CreateImgPostDto } from './create-img_post.dto';

export class UpdateImgPostDto extends PartialType(CreateImgPostDto) {}
