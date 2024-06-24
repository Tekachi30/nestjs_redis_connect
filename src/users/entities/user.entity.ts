import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, BeforeInsert } from "typeorm"

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
}
