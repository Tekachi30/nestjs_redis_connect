import { Post } from 'src/posts/entities/post.entity';

export class CreateImgPostDto {
  img_public_key: string;

  img_url: string;

  post: Post;
}
