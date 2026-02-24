import { IsEmail, IsNotEmpty, IsString, IsEnum, MinLength } from 'class-validator';
import { RoleName } from '../../roles/entities/role.entity';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsEnum(RoleName)
    @IsNotEmpty()
    role: RoleName;
}
