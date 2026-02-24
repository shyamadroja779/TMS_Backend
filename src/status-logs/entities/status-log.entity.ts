import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { TicketStatus } from '../../common/enums/ticket.enum';
import { User } from '../../users/entities/user.entity';

@Entity('ticket_status_logs')
export class StatusLog {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Ticket)
    @JoinColumn({ name: 'ticket_id' })
    ticket: Ticket;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        name: 'old_status',
    })
    oldStatus: TicketStatus;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        name: 'new_status',
    })
    newStatus: TicketStatus;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'changed_by' })
    changedBy: User;

    @CreateDateColumn({ name: 'changed_at' })
    changedAt: Date;
}
