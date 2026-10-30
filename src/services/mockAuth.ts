export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Demo rules: password "wrong123" fails login, email "taken@example.com" fails register.
export async function login(email: string, password: string): Promise<AuthUser> {
  await delay(800);
  if (password === 'wrong123') throw new Error('Incorrect email or password');
  return { id: '1', name: email.split('@')[0], email };
}

export async function register(
  name: string,
  email: string,
  _password: string,
): Promise<AuthUser> {
  await delay(900);
  if (email.toLowerCase() === 'taken@example.com') {
    throw new Error('This email is already registered');
  }
  return { id: String(Date.now()), name, email };
}