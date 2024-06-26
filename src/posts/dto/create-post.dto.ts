import { IsNotBlank } from "src/assist/validatorCustom"
import { User } from "src/users/entities/user.entity"

export class CreatePostDto {
    @IsNotBlank()
    title: string

    content: string

    user: User
}
