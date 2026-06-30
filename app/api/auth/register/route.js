import { NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '../../../lib/db';
import { encrypt } from '../../../lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const newUser = await createUser({ name, email, password });
    
    const { password: _, ...userWithoutPassword } = newUser;
    const sessionToken = await encrypt(userWithoutPassword);
    
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: false, // Force false for HTTP IP testing
      sameSite: 'lax',
      path: '/'
    });

    return NextResponse.json({ user: userWithoutPassword });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
