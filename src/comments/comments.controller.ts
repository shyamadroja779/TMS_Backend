import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post('tickets/:id/comments')
    @ApiOperation({ summary: 'Add a comment to a ticket' })
    create(@Param('id') id: string, @Body() createCommentDto: CreateCommentDto, @Request() req) {
        return this.commentsService.create(+id, createCommentDto, req.user);
    }

    @Get('tickets/:id/comments')
    @ApiOperation({ summary: 'List all comments for a ticket' })
    findAll(@Param('id') id: string, @Request() req) {
        return this.commentsService.findByTicket(+id, req.user);
    }

    @Patch('comments/:id')
    @ApiOperation({ summary: 'Edit a comment (author or MANAGER)' })
    update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @Request() req) {
        return this.commentsService.update(+id, updateCommentDto, req.user);
    }

    @Delete('comments/:id')
    @ApiOperation({ summary: 'Delete a comment (author or MANAGER)' })
    remove(@Param('id') id: string, @Request() req) {
        return this.commentsService.remove(+id, req.user);
    }
}
