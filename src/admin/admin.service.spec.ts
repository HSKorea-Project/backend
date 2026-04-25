import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AdminService', () => {
  let service: AdminService;

  const mockRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Admin), useValue: mockRepo },
      ],
    }).compile();

    service = module.get(AdminService);
  });

  afterEach(() => jest.clearAllMocks());

  /* =========================
   * LOGIN
   * ========================= */
  it('login success', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 1,
      adminId: 'admin',
      password: 'hashed',
    });

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const result = await service.login({
      adminId: 'admin',
      password: '1234',
      deviceId: 'device-1',
    } as any);

    expect(result).toEqual({
      admin: {
        id: 1,
        adminId: 'admin',
        password: 'hashed',
      },
      deviceId: 'device-1',
    });
  });

  it('login fail - user not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(
      service.login({
        adminId: 'admin',
        password: '1234',
        deviceId: 'device',
      } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login fail - wrong password', async () => {
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
        deviceId: 'device',
      } as any),
    ).rejects.toThrow(UnauthorizedException);
  });
});