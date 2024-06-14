import {
    IsNotEmpty
  } from 'class-validator';
export class CreateUserDto 
{
    @IsNotEmpty({ message: 'Không được để trống' })
    name: string
}
