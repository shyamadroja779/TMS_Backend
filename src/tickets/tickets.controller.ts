import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../roles/entities/role.entity';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Roles(RoleName.USER, RoleName.MANAGER)
    @Post()
    @ApiOperation({ summary: 'Create a ticket (USER, MANAGER)' })
    create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
        return this.ticketsService.create(createTicketDto, req.user);
    }

    @Roles(RoleName.MANAGER, RoleName.SUPPORT, RoleName.USER)
    @Get()
    @ApiOperation({ summary: 'Get tickets based on role permissions' })
    findAll(@Request() req) {
        return this.ticketsService.findAll(req.user);
    }

    @Roles(RoleName.MANAGER, RoleName.SUPPORT)
    @Patch(':id/assign')
    @ApiOperation({ summary: 'Assign ticket to support staff' })
    assign(@Param('id') id: string, @Body() assignTicketDto: AssignTicketDto) {
        return this.ticketsService.assign(+id, assignTicketDto.userId);
    }

    @Roles(RoleName.MANAGER, RoleName.SUPPORT)
    @Patch(':id/status')
    @ApiOperation({ summary: 'Update ticket status' })
    updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto, @Request() req) {
        return this.ticketsService.updateStatus(+id, updateStatusDto.status, req.user);
    }

    @Roles(RoleName.MANAGER)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a ticket (MANAGER only)' })
    remove(@Param('id') id: string) {
        return this.ticketsService.remove(+id);
    }
}
