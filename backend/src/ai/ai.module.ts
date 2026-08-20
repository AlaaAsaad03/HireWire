import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [MatchModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService]
})
export class AiModule { }
