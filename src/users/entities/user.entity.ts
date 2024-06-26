// user.entity.ts
import { Post } from "src/posts/entities/post.entity";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm"

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: true })
    age: number;

    @Column({ nullable: true })
    info: string

    @OneToMany(() => Post, post => post.user)
    posts: Post[];
}
