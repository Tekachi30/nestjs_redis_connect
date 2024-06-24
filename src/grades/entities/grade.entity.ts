import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, BeforeInsert } from "typeorm"

@Entity({ name: 'grades' })
export class Grade {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    subject: string

    @Column({ nullable: false })
    quantity: number
}
