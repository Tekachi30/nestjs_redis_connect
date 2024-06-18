import { IsNotBlank } from "src/assist/validatorCustom";

export class CreateGradeDto {
    @IsNotBlank()
    subject: string

    quantity: number
}
