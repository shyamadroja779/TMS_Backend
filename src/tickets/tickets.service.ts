import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketStatus } from '../common/enums/ticket.enum';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { User } from '../users/entities/user.entity';
import { RoleName } from '../roles/entities/role.entity';
import { StatusLog } from '../status-logs/entities/status-log.entity';

@Injectable()
export class TicketsService {
    private readonly statusTransition: Record<TicketStatus, TicketStatus[]> = {
        [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
        [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED],
        [TicketStatus.RESOLVED]: [TicketStatus.CLOSED],
        [TicketStatus.CLOSED]: [], // No further transitions
    };

    constructor(
        @InjectRepository(Ticket)
        private ticketRepository: Repository<Ticket>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(StatusLog)
        private statusLogRepository: Repository<StatusLog>,
    ) { }

    async create(createTicketDto: CreateTicketDto, user: User) {
        const ticket = this.ticketRepository.create({
            ...createTicketDto,
            createdBy: user,
        });
        return this.ticketRepository.save(ticket);
    }

    async findAll(user: User) {
        const userRole = user.role.name;

        if (userRole === RoleName.MANAGER) {
            return this.ticketRepository.find({ relations: ['createdBy', 'assignedTo'] });
        } else if (userRole === RoleName.SUPPORT) {
            return this.ticketRepository.find({
                where: { assignedTo: { id: user.id } },
                relations: ['createdBy', 'assignedTo'],
            });
        } else {
            return this.ticketRepository.find({
                where: { createdBy: { id: user.id } },
                relations: ['createdBy', 'assignedTo'],
            });
        }
    }

    async assign(id: number, userId: number) {
        const ticket = await this.ticketRepository.findOne({ where: { id } });
        if (!ticket) throw new NotFoundException('Ticket not found');

        const userToAssign = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['role']
        });

        if (!userToAssign) throw new NotFoundException('User not found');
        if (userToAssign.role.name === RoleName.USER) {
            throw new BadRequestException('Cannot assign tickets to users with role USER');
        }

        ticket.assignedTo = userToAssign;
        return this.ticketRepository.save(ticket);
    }

    async updateStatus(id: number, newStatus: TicketStatus, user: User) {
        const ticket = await this.ticketRepository.findOne({
            where: { id },
            relations: ['assignedTo']
        });
        if (!ticket) throw new NotFoundException('Ticket not found');

        if (user.role.name === RoleName.SUPPORT && ticket.assignedTo?.id !== user.id) {
            throw new ForbiddenException('You can only update status for tickets assigned to you');
        }

        const oldStatus = ticket.status;

        const allowed = this.statusTransition[oldStatus];
        if (!allowed.includes(newStatus)) {
            throw new BadRequestException(`Invalid status transition from ${oldStatus} to ${newStatus}`);
        }

        ticket.status = newStatus;
        const updatedTicket = await this.ticketRepository.save(ticket);

        const log = this.statusLogRepository.create({
            ticket: updatedTicket,
            oldStatus,
            newStatus,
            changedBy: user,
        });
        await this.statusLogRepository.save(log);

        return updatedTicket;
    }

    async remove(id: number) {
        const ticket = await this.ticketRepository.findOne({ where: { id } });
        if (!ticket) throw new NotFoundException('Ticket not found');
        return this.ticketRepository.remove(ticket);
    }
}
