import { NextRequest, NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      await request.json();

    const {
      name,
      email,
      password,
    } = body;

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            'User already exists',
        },
        {
          status: 400,
        },
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10,
      );

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          password:
            hashedPassword,
        },
      });

    return NextResponse.json({
      success: true,

      user: {
        id: user.id,

        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          'Internal Server Error',
      },
      {
        status: 500,
      },
    );
  }
}