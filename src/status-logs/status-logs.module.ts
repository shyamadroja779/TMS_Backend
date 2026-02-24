import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusLog } from './entities/status-log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([StatusLog])],
    exports: [TypeOrmModule],
})
export class StatusLogsModule { }
