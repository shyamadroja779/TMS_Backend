import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../roles/entities/role.entity';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Roles(RoleName.MANAGER)
    @Post()
    @ApiOperation({ summary: 'Create a new user (MANAGER only)' })
    @ApiResponse({ status: 201, description: 'User created' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Roles(RoleName.MANAGER)
    @Get()
    @ApiOperation({ summary: 'List all users (MANAGER only)' })
    @ApiResponse({ status: 200, description: 'List of users' })
    findAll() {
        return this.usersService.findAll();
    }
}
