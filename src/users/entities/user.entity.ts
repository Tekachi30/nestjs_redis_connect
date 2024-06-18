import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity({ name: 'users' })
export class User {
    @Column({ nullable: false })
    name: string;

    @Column({ nullable: true })
    age: number;

    @Column({ nullable: true })
    info: string
}
