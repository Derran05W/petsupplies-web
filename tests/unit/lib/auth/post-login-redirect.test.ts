import { describe, expect, it } from 'vitest';
import {
  DEFAULT_POST_LOGIN_PATH,
  resolvePostLoginPath,
  withAuthRedirectQuery,
} from '@/lib/auth/post-login-redirect';
import { buildLoginHref } from '@/lib/navigation/login-href';

describe('post-login redirect', () => {
  it('defaults to the homepage when redirect is missing', () => {
    expect(DEFAULT_POST_LOGIN_PATH).toBe('/');
    expect(resolvePostLoginPath(null)).toBe('/');
    expect(resolvePostLoginPath(undefined)).toBe('/');
  });

  it('honours safe redirect paths', () => {
    expect(resolvePostLoginPath('/products?category=DOG')).toBe(
      '/products?category=DOG',
    );
    expect(resolvePostLoginPath('https://evil.test')).toBe('/');
  });

  it('preserves redirect between auth pages', () => {
    expect(withAuthRedirectQuery('/login', '/cart')).toBe(
      '/login?redirect=%2Fcart',
    );
    expect(withAuthRedirectQuery('/signup', '/')).toBe('/signup');
  });
});

describe('buildLoginHref', () => {
  it('returns plain /login on auth pages and homepage', () => {
    expect(buildLoginHref('/login')).toBe('/login');
    expect(buildLoginHref('/')).toBe('/login');
  });

  it('includes redirect for storefront pages', () => {
    expect(buildLoginHref('/products', 'category=DOG')).toBe(
      '/login?redirect=%2Fproducts%3Fcategory%3DDOG',
    );
  });
});
