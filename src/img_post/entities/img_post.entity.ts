import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'img_posts' })
export class ImgPost {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ nullable: false })
  img_url: string;

  @Column({ nullable: false })
  img_public_key: string;

  @CreateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // Các ràng buộc:
  @ManyToOne(() => Post, (post) => post.img_posts)
  post: Post;
}
