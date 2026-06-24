import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '../../../lib/auth';
import { getUserById } from '../../../lib/db';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = await decrypt(session);
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Get fresh user data from DB
  const user = await getUserById(payload.id);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const { password, ...userWithoutPassword } = user;
  return NextResponse.json({ user: userWithoutPassword });
}
