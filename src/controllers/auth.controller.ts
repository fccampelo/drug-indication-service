import { Request, Response } from 'express';
import { AuthService } from '@services/auth.service';
import { LoginRequest, RegisterRequest } from '@types';
import { asyncHandler } from '@middleware/error.middleware';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *             user:
 *               $ref: '#/components/schemas/User'
 */

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userData: RegisterRequest = req.body;

  const result = await AuthService.register(userData);

  res.status(201).json({
    success: true,
    data: result,
    message: 'User registered successfully',
  });
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const credentials: LoginRequest = req.body;

  const result = await AuthService.login(credentials);

  res.status(200).json({
    success: true,
    data: result,
    message: 'Login successful',
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: req.user,
    message: 'Profile retrieved successfully',
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'User not authenticated',
    });
    return;
  }

  const newToken = await AuthService.refreshToken(req.user._id.toString());

  res.status(200).json({
    success: true,
    data: { token: newToken },
    message: 'Token refreshed successfully',
  });
}); 