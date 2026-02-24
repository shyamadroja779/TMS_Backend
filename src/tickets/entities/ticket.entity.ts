import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { StatusLog } from '../../status-logs/entities/status-log.entity';

import { TicketStatus, TicketPriority } from '../../common/enums/ticket.enum';

@Entity('tickets')
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.OPEN,
    })
    status: TicketStatus;

    @Column({
        type: 'enum',
        enum: TicketPriority,
        default: TicketPriority.MEDIUM,
    })
    priority: TicketPriority;

    @ManyToOne(() => User, (user) => user.ticketsCreated)
    @JoinColumn({ name: 'created_by' })
    createdBy: User;

    @ManyToOne(() => User, (user) => user.ticketsAssigned, { nullable: true })
    @JoinColumn({ name: 'assigned_to' })
    assignedTo: User;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => Comment, (comment) => comment.ticket)
    comments: Comment[];

    @OneToMany(() => StatusLog, (log) => log.ticket)
    statusLogs: StatusLog[];
}
