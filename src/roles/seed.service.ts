import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, RoleName } from './entities/role.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        for (const roleName of Object.values(RoleName)) {
            const exists = await this.roleRepository.findOne({ where: { name: roleName } });
            if (!exists) {
                await this.roleRepository.save({ name: roleName });
                console.log(`Created role: ${roleName}`);
            }
        }

        const userCount = await this.userRepository.count();
        if (userCount === 0) {
            const managerRole = await this.roleRepository.findOne({ where: { name: RoleName.MANAGER } });
            if (!managerRole) {
                throw new Error('Manager role not found during seeding');
            }

            const hashedAdminPassword = await bcrypt.hash('admin123', 10);

            const admin = this.userRepository.create({
                name: 'System Admin',
                email: 'admin@tms.com',
                password: hashedAdminPassword,
                role: managerRole,
            });

            await this.userRepository.save(admin);
            console.log('Created initial MANAGER user: admin@tms.com / admin123');
        }
    }
}
