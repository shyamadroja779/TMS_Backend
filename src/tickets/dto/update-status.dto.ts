import { IsEnum, IsNotEmpty } from 'class-validator';
import { TicketStatus } from '../../common/enums/ticket.enum';

export class UpdateStatusDto {
    @IsEnum(TicketStatus)
    @IsNotEmpty()
    status: TicketStatus;
}
