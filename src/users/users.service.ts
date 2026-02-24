import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role, RoleName } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
    ) { }

    async create(createUserDto: CreateUserDto) {
        const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const role = await this.roleRepository.findOne({ where: { name: createUserDto.role } });
        if (!role) {
            throw new NotFoundException(`Role ${createUserDto.role} not found`);
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
            role: role,
        });

        return this.userRepository.save(user);
    }

    async findAll() {
        return this.userRepository.find();
    }

    async findByRole(roleName: RoleName) {
        return this.userRepository.find({
            where: { role: { name: roleName } }
        });
    }
}
