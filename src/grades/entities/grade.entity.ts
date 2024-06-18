import { User } from "src/users/entities/user.entity"
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm"

@Entity({ name: 'grades' })
export class Grade {
    @Column({ nullable: false })
    subject: string

}
