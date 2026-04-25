import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    authenticate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('비밀번호 인증 성공 시 세션에 inquiryAuth 저장', async () => {
    // given
    const inquiryId = 'test-id';
    const password = '1234';

    mockUserService.authenticate.mockResolvedValue({
      inquiryId,
    });

    const req: any = {
      session: {},
    };

    // when
    const result = await controller.authPost(
      inquiryId,
      { password },
      req,
    );

    // then
    expect(userService.authenticate).toHaveBeenCalledWith(
      inquiryId,
      password,
    );

    expect(req.session.inquiryAuth).toEqual({
      [inquiryId]: true,
    });

    expect(result).toEqual({
      message: '인증 성공',
    });
  });
});