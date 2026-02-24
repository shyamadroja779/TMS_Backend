import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignTicketDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;
}
