import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AdminService', () => {
  let service: AdminService;

  const mockRepo = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Admin),
          useValue: mockRepo,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('login success', async () => {
    const admin = {
      id: '1',
      adminId: 'admin',
      password: 'hashed_pw',
    };

    mockRepo.findOne.mockResolvedValue(admin);
    mockJwtService.sign.mockReturnValue('access-token');

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const result = await service.login('admin', '1234');

    expect(result).toEqual({
      message: '관리자 로그인 성공',
      data: {
        accessToken: 'access-token',
      },
    });
  });

  it('fail - admin not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(
      service.login('admin', '1234'),
    ).rejects.toThrow('사용자가 존재하지 않습니다.');
  });

  it('fail - wrong password', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: '1',
      adminId: 'admin',
      password: 'hashed_pw',
    });

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(
      service.login('admin', 'wrong'),
    ).rejects.toThrow('비밀번호가 일치하지 않습니다.');
  });
});