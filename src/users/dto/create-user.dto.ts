import { IsNotEmpty } from 'class-validator';
import { IsNotBlank } from '../../assist/validatorCustom';
export class CreateUserDto {
  // @IsNotEmpty({ message: 'Không được để trống' })
  @IsNotBlank()
  name: string;

  age: number;
  info: string;
}
