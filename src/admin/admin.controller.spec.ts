import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  const mockAdminService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('로그인 성공 시 세션에 user 저장', async () => {
    const mockData = {
      admin: { id: 1 },
      deviceId: 'device-123',
    };

    mockAdminService.login.mockResolvedValue(mockData);

    const req: any = {
      session: {},
    };

    const result = await controller.login(req, {
      adminId: 'admin',
      password: '1234',
      deviceId: 'device-123',
    });

    expect(adminService.login).toHaveBeenCalled();

    expect(req.session.user).toEqual({
      id: 1,
      role: 'admin',
      deviceId: 'device-123',
    });

    expect(result).toEqual({
      message: '로그인 성공',
    });
  });

  it('로그인 실패 시 에러 발생', async () => {
    mockAdminService.login.mockRejectedValue(new Error('인증 실패'));

    const req: any = { session: {} };

    await expect(
      controller.login(req, {
        adminId: 'admin',
        password: 'wrong',
        deviceId: 'device-123',
      }),
    ).rejects.toThrow();
  });

  it('로그아웃 시 세션 destroy 호출', async () => {
    const destroyMock = jest.fn((cb) => cb());

    const req: any = {
      session: {
        destroy: destroyMock,
      },
    };

    const result = await controller.logout(req);

    expect(destroyMock).toHaveBeenCalled();

    expect(result).toEqual({
      message: '로그아웃 성공',
    });
  });
});