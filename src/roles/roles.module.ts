import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { User } from '../users/entities/user.entity';
import { SeedService } from './seed.service';

@Module({
    imports: [TypeOrmModule.forFeature([Role, User])],
    providers: [SeedService],
    exports: [TypeOrmModule],
})
export class RolesModule { }
