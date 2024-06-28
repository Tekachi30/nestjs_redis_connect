// post.entity.ts
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'posts' })
export class Post {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: true })
    content: string;

    @ManyToOne(() => User, user => user.posts)
    user: User;
}
