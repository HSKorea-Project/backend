import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;

  const mockService = {
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  const mockRes = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as any;

  const mockReq = {
    cookies: {},
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockService },
      ],
    }).compile();

    controller = module.get(AdminController);
  });

  afterEach(() => jest.clearAllMocks());

  /* =========================
   * LOGIN
   * ========================= */
  it('login success', async () => {
    mockService.login.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      deviceId: 'device-1',
    });

    const result = await controller.login(
      {
        adminId: 'admin',
        password: '1234',
        deviceId: 'device-1',
      } as any,
      mockRes,
    );

    expect(mockService.login).toHaveBeenCalled();

    expect(mockRes.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh',
      expect.any(Object),
    );

    expect(result).toEqual({
      message: '로그인 성공',
      data: {
        accessToken: 'access',
        deviceId: 'device-1',
      },
    });
  });

  /* =========================
   * REFRESH
   * ========================= */
  it('refresh success', async () => {
    mockReq.cookies.refreshToken = 'token';

    mockService.refresh.mockResolvedValue({
      accessToken: 'new-access',
      deviceId: 'device-1',
    });

    const result = await controller.refresh(mockReq);

    expect(mockService.refresh).toHaveBeenCalledWith('token');

    expect(result).toEqual({
      message: '토큰 재발급 성공',
      data: {
        accessToken: 'new-access',
        deviceId: 'device-1',
      },
    });
  });

  /* =========================
   * LOGOUT
   * ========================= */
  it('logout success', async () => {
    mockReq.cookies.refreshToken = 'token';

    const result = await controller.logout(mockReq, mockRes);

    expect(mockService.logout).toHaveBeenCalledWith('token');
    expect(mockRes.clearCookie).toHaveBeenCalledWith('refreshToken');

    expect(result).toEqual({
      message: '로그아웃 성공',
    });
  });
});