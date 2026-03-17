import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserWithoutPassword {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function registerUser(
  input: RegisterInput
): Promise<{ user: UserWithoutPassword; tokens: AuthTokens }> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new Error('Email already in use');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const tokens = await createTokenPair(user.id, user.email);

  return { user, tokens };
}

export async function loginUser(
  input: LoginInput
): Promise<{ user: UserWithoutPassword; tokens: AuthTokens }> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const tokens = await createTokenPair(user.id, user.email);

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, tokens };
}

export async function refreshTokens(
  refreshToken: string
): Promise<{ tokens: AuthTokens; user: UserWithoutPassword }> {
  // Verify the token signature
  const payload = verifyRefreshToken(refreshToken);

  // Check token exists in DB and is not expired
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new Error('Refresh token not found or already used');
  }

  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new Error('Refresh token has expired');
  }

  if (storedToken.userId !== payload.userId) {
    throw new Error('Token mismatch');
  }

  // Delete old refresh token (rotation)
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  // Issue new token pair
  const tokens = await createTokenPair(storedToken.user.id, storedToken.user.email);

  const { passwordHash: _, ...userWithoutPassword } = storedToken.user;

  return { tokens, user: userWithoutPassword };
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
}

export async function logoutAllSessions(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

async function createTokenPair(userId: string, email: string): Promise<AuthTokens> {
  const payload = { userId, email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return { accessToken, refreshToken };
}
