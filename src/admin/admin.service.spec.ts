import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';

describe('AdminService', () => {
  let service: AdminService;

  const mockRepo = {
    findOne: jest.fn(),
  };

  const mockJwt = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockRedis = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Admin), useValue: mockRepo },
        { provide: JwtService, useValue: mockJwt },
        { provide: Redis, useValue: mockRedis },
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
      id: '1',
      adminId: 'admin',
      password: 'hashed',
    });

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    mockJwt.sign
      .mockReturnValueOnce('access')
      .mockReturnValueOnce('refresh');

    const result = await service.login({
      adminId: 'admin',
      password: '1234',
      deviceId: 'device-1',
    } as any);

    expect(result).toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
      deviceId: 'device-1',
    });

    expect(mockRedis.set).toHaveBeenCalled();
  });

  it('login fail', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(
      service.login({
        adminId: 'admin',
        password: '1234',
        deviceId: 'device',
      } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  /* =========================
   * REFRESH
   * ========================= */
  it('refresh success', async () => {
    mockJwt.verify.mockReturnValue({
      sub: '1',
      adminId: 'admin',
      deviceId: 'device-1',
      jti: 'abc',
    });

    mockRedis.get.mockResolvedValue(JSON.stringify({ jti: 'abc' }));
    mockJwt.sign.mockReturnValue('new-access');

    const result = await service.refresh('token');

    expect(result).toEqual({
      accessToken: 'new-access',
      deviceId: 'device-1',
    });
  });

  it('refresh fail - no session', async () => {
    mockJwt.verify.mockReturnValue({
      sub: '1',
      deviceId: 'device-1',
      jti: 'abc',
    });

    mockRedis.get.mockResolvedValue(null);

    await expect(service.refresh('token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  /* =========================
   * LOGOUT
   * ========================= */
  it('logout success', async () => {
    mockJwt.verify.mockReturnValue({
      sub: '1',
      deviceId: 'device-1',
    });

    await service.logout('token');

    expect(mockRedis.del).toHaveBeenCalledWith(
      'session:1:device-1',
    );
  });
});