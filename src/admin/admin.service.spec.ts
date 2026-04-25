import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let repo: Repository<Admin>;

  const mockRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Admin),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    repo = module.get<Repository<Admin>>(getRepositoryToken(Admin));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('admin이 없으면 인증 실패', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(
      service.login({
        adminId: 'admin',
        password: '1234',
        deviceId: 'device-1',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('비밀번호가 틀리면 인증 실패', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 1,
      adminId: 'admin',
      password: 'hashed',
    });

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(
      service.login({
        adminId: 'admin',
        password: 'wrong',
        deviceId: 'device-1',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('정상 로그인 시 admin과 deviceId 반환', async () => {
    const mockAdmin = {
      id: 1,
      adminId: 'admin',
      password: 'hashed',
    };

    mockRepo.findOne.mockResolvedValue(mockAdmin);

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const result = await service.login({
      adminId: 'admin',
      password: 'correct',
      deviceId: 'device-1',
    });

    expect(result).toEqual({
      admin: mockAdmin,
      deviceId: 'device-1',
    });
  });
});