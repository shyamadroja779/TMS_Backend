import { IsNotEmpty, IsString, IsEnum, MinLength } from 'class-validator';
import { TicketPriority } from '../../common/enums/ticket.enum';

export class CreateTicketDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    title: string;

    @IsString()
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    description: string;

    @IsEnum(TicketPriority)
    @IsNotEmpty()
    priority: TicketPriority;
}
