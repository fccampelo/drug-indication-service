import jwt from 'jsonwebtoken';
import { User, UserDocument } from '@models/User';
import { env } from '@config/env';
import { AppError, AuthResponse, LoginRequest, RegisterRequest, JwtPayloadWithUser } from '@types';

export class AuthService {
  private static generateToken(user: UserDocument): string {
    const payload: Omit<JwtPayloadWithUser, 'iat' | 'exp'> = {
      userId: (user._id as any).toString(),
      email: user.email,
      roles: user.roles,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: '24h',
    });
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new AppError('User already exists with this email', 409);
      }

      const user = new User({
        email: userData.email,
        password: userData.password,
        roles: userData.roles,
      });

      await user.save();

      const token = this.generateToken(user);

      const userResponse = user.toJSON();

      return {
        token,
        user: userResponse,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error creating user', 500);
    }
  }

  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const user = await User.findOne({ email: credentials.email }).select('+password');
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      const isPasswordValid = await user.comparePassword(credentials.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = this.generateToken(user);

      const userResponse = user.toJSON();

      return {
        token,
        user: userResponse,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error during login', 500);
    }
  }

  static async verifyToken(token: string): Promise<JwtPayloadWithUser> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayloadWithUser;
      return decoded;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  static async getUserById(userId: string): Promise<UserDocument | null> {
    try {
      return await User.findById(userId);
    } catch (error) {
      throw new AppError('Error fetching user', 500);
    }
  }

  static async refreshToken(userId: string): Promise<string> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      return this.generateToken(user);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error refreshing token', 500);
    }
  }
} 