import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../users/entities/user.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { RoleName } from '../roles/entities/role.entity';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private commentRepository: Repository<Comment>,
        @InjectRepository(Ticket)
        private ticketRepository: Repository<Ticket>,
    ) { }

    async create(ticketId: number, createCommentDto: CreateCommentDto, user: User) {
        const ticket = await this.ticketRepository.findOne({
            where: { id: ticketId },
            relations: ['createdBy', 'assignedTo']
        });
        if (!ticket) throw new NotFoundException('Ticket not found');

        // Authorization check
        this.checkTicketAccess(ticket, user);

        const comment = this.commentRepository.create({
            ...createCommentDto,
            ticket,
            user,
        });
        return this.commentRepository.save(comment);
    }

    async findByTicket(ticketId: number, user: User) {
        const ticket = await this.ticketRepository.findOne({
            where: { id: ticketId },
            relations: ['createdBy', 'assignedTo']
        });
        if (!ticket) throw new NotFoundException('Ticket not found');

        this.checkTicketAccess(ticket, user);

        return this.commentRepository.find({
            where: { ticket: { id: ticketId } },
            relations: ['user'],
        });
    }

    async update(id: number, updateCommentDto: UpdateCommentDto, user: User) {
        const comment = await this.commentRepository.findOne({
            where: { id },
            relations: ['user']
        });
        if (!comment) throw new NotFoundException('Comment not found');

        if (user.role.name !== RoleName.MANAGER && comment.user.id !== user.id) {
            throw new ForbiddenException('You can only edit your own comments');
        }

        comment.comment = updateCommentDto.comment;
        return this.commentRepository.save(comment);
    }

    async remove(id: number, user: User) {
        const comment = await this.commentRepository.findOne({
            where: { id },
            relations: ['user']
        });
        if (!comment) throw new NotFoundException('Comment not found');

        if (user.role.name !== RoleName.MANAGER && comment.user.id !== user.id) {
            throw new ForbiddenException('You can only delete your own comments');
        }

        return this.commentRepository.remove(comment);
    }

    private checkTicketAccess(ticket: Ticket, user: User) {
        if (user.role.name === RoleName.MANAGER) return;
        if (user.id === ticket.createdBy.id) return;
        if (ticket.assignedTo && user.id === ticket.assignedTo.id) return;

        throw new ForbiddenException('You do not have access to this ticket');
    }
}
