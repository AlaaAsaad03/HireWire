import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    providers: [MatchService],
    controllers: [MatchController],
    exports: [MatchService],
})
export class MatchModule { }