import { NextResponse } from 'next/server';
import { getUserByEmail } from '../../../lib/db';
import { encrypt } from '../../../lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const user = await getUserByEmail(email);

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Strip password from payload
    const { password: _, ...userWithoutPassword } = user;
    
    // Create JWT
    const sessionToken = await encrypt(userWithoutPassword);
    
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return NextResponse.json({ user: userWithoutPassword });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
