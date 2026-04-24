import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

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
    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call adminService.login with correct params', async () => {
    const dto = { adminId: 'admin', password: '1234' };

    mockAdminService.login.mockResolvedValue({
      message: '관리자 로그인 성공',
      data: { accessToken: 'token' },
    });

    const result = await controller.login(dto);

    expect(service.login).toHaveBeenCalledWith('admin', '1234');

    expect(result).toEqual({
      message: '관리자 로그인 성공',
      data: { accessToken: 'token' },
    });
  });
});