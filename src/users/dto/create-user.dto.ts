import { IsNotEmpty } from 'class-validator';
import { IsNotBlank } from '../../assist/validatorCustom';
import { Grade } from 'src/grades/entities/grade.entity';
export class CreateUserDto {
  // @IsNotEmpty({ message: 'Không được để trống' })
  @IsNotBlank()
  name: string;

  age: number;

  info: string;

}
