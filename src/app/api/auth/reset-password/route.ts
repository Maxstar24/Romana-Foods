import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuth } from '@/lib/logger';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find the reset token
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date() > resetRecord.expiresAt) {
      // Clean up expired token
      await prisma.passwordReset.delete({
        where: { id: resetRecord.id }
      });
      
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Check if token was already used
    if (resetRecord.used) {
      return NextResponse.json(
        { error: 'Reset token has already been used' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and mark token as used
    await prisma.$transaction(async (tx: typeof prisma) => {
      await tx.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword }
      });

      await tx.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true }
      });
    });

    // Secure logging for successful password reset
    logAuth.passwordResetComplete(resetRecord.userId, true);

    return NextResponse.json({
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    // Secure error logging without exposing sensitive data
    logAuth.error('PASSWORD_RESET', error as Error, { 
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
