import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;

  const mockService = {
    login: jest.fn(),
  };

  const mockReq = {
    session: {},
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: mockService }],
    }).compile();

    controller = module.get(AdminController);
  });

  afterEach(() => jest.clearAllMocks());

  /* =========================
   * LOGIN
   * ========================= */
  it('login success', async () => {
    mockService.login.mockResolvedValue({
      admin: { id: 1 },
      deviceId: 'device-1',
    });

    const result = await controller.login(
      mockReq,
      { adminId: 'admin', password: '1234', deviceId: 'device-1' } as any,
    );

    expect(mockService.login).toHaveBeenCalled();

    expect(mockReq.session.user).toEqual({
      id: 1,
      role: 'admin',
      deviceId: 'device-1',
    });

    expect(result).toEqual({
      message: '로그인 성공',
    });
  });

  /* =========================
   * LOGOUT
   * ========================= */
  it('logout success', async () => {
    mockReq.session = {
      destroy: jest.fn((cb) => cb && cb()),
    };

    const result = await controller.logout(mockReq);

    expect(mockReq.session.destroy).toHaveBeenCalled();

    expect(result).toEqual({
      message: '로그아웃 성공',
    });
  });
});