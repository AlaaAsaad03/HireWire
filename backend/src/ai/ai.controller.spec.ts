import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import { MatchService } from '../match/match.service';

describe('AiController', () => {
  let controller: AiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        AiService,
        MatchService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
