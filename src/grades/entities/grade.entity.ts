// grade.entity.ts
import { Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity({ name: 'grades' })
export class Grade {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    subject: string

    @Column({ nullable: true })
    quantity: number
}
