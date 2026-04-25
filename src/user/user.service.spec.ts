import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InquiryEntity } from '../inquiry/inquiry.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ForbiddenException } from 'src/global/error/custom.exception';

describe('UserService', () => {
  let service: UserService;
  let repo: Repository<InquiryEntity>;

  const mockRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(InquiryEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get<Repository<InquiryEntity>>(
      getRepositoryToken(InquiryEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('문의가 없으면 예외 발생', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(
      service.authenticate('id', 'pw'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('비밀번호가 틀리면 예외 발생', async () => {
    mockRepo.findOne.mockResolvedValue({
      inquiryId: 'id',
      passwordHash: 'hashed',
    });

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(
      service.authenticate('id', 'wrong'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('정상 인증 시 inquiryId 반환', async () => {
    mockRepo.findOne.mockResolvedValue({
      inquiryId: 'id',
      passwordHash: 'hashed',
    });

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const result = await service.authenticate('id', 'correct');

    expect(result).toEqual({ inquiryId: 'id' });
  });
});
