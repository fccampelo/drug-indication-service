import { AuthService } from '../../src/services/auth.service';
import { User } from '../../src/models/User';
import { AppError, UserRole } from '../../src/types';

describe('AuthService', () => {
  const mockUserData = {
    email: 'test@example.com',
    password: 'Password123',
    roles: [UserRole.USER],
  };

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result = await AuthService.register(mockUserData);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(mockUserData.email);
      expect(result.user.roles).toEqual(mockUserData.roles);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error if user already exists', async () => {
      // Create user first
      await AuthService.register(mockUserData);

      // Try to register same user again
      await expect(AuthService.register(mockUserData)).rejects.toThrow(AppError);
    });

    it('should hash password before saving', async () => {
      await AuthService.register(mockUserData);

      const user = await User.findOne({ email: mockUserData.email }).select('+password');
      expect(user?.password).not.toBe(mockUserData.password);
      expect(user?.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await AuthService.register(mockUserData);
    });

    it('should login with valid credentials', async () => {
      const result = await AuthService.login({
        email: mockUserData.email,
        password: mockUserData.password,
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(mockUserData.email);
    });

    it('should throw error with invalid email', async () => {
      await expect(
        AuthService.login({
          email: 'wrong@example.com',
          password: mockUserData.password,
        }),
      ).rejects.toThrow(AppError);
    });

    it('should throw error with invalid password', async () => {
      await expect(
        AuthService.login({
          email: mockUserData.email,
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(AppError);
    });
  });

  describe('verifyToken', () => {
    let token: string;

    beforeEach(async () => {
      const result = await AuthService.register(mockUserData);
      token = result.token;
    });

    it('should verify valid token', async () => {
      const decoded = await AuthService.verifyToken(token);

      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('roles');
      expect(decoded.email).toBe(mockUserData.email);
    });

    it('should throw error with invalid token', async () => {
      await expect(AuthService.verifyToken('invalid-token')).rejects.toThrow(AppError);
    });
  });

  describe('getUserById', () => {
    let userId: string;

    beforeEach(async () => {
      const result = await AuthService.register(mockUserData);
      const decoded = await AuthService.verifyToken(result.token);
      userId = decoded.userId;
    });

    it('should get user by valid ID', async () => {
      const user = await AuthService.getUserById(userId);

      expect(user).toBeTruthy();
      expect(user?.email).toBe(mockUserData.email);
    });

    it('should return null for invalid ID', async () => {
      const user = await AuthService.getUserById('507f1f77bcf86cd799439011');
      expect(user).toBeNull();
    });
  });

  describe('refreshToken', () => {
    let userId: string;

    beforeEach(async () => {
      const result = await AuthService.register(mockUserData);
      const decoded = await AuthService.verifyToken(result.token);
      userId = decoded.userId;
    });

    it('should refresh token for valid user', async () => {
      const newToken = await AuthService.refreshToken(userId);

      expect(typeof newToken).toBe('string');
      expect(newToken.length).toBeGreaterThan(0);

      // Verify the new token is valid
      const decoded = await AuthService.verifyToken(newToken);
      expect(decoded.userId).toBe(userId);
    });

    it('should throw error for invalid user ID', async () => {
      await expect(AuthService.refreshToken('507f1f77bcf86cd799439011')).rejects.toThrow(AppError);
    });
  });
});
