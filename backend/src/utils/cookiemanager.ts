import { Response, CookieOptions } from "express";

export class CookieManager {
  /**
   * Sets authentication cookies for access and refresh tokens.
   *
   * @param res - Express Response object.
   * @param tokens - An object containing accessToken and refreshToken.
   * @param options - Optional configuration overrides.
   */
  static setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
    options?: {
      accessTokenMaxAge?: number;
      refreshTokenMaxAge?: number;
      secure?: boolean;
      sameSite?: "strict" | "lax" | "none";
      includeAccessTokenInBody?: boolean; // Optional: return token in response body
    }
  ): void {
    // Hardcode secure: true for Vercel's HTTPS environment
    const secure = options?.secure ?? true;
    // Default to "lax" for cross-site compatibility (frontend/backend on different domains)
    const sameSite = options?.sameSite ?? "lax";

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure, // true for HTTPS
      sameSite, // "lax" for Vercel cross-domain requests
      maxAge: options?.accessTokenMaxAge ?? 30 * 60 * 1000, // 30 minutes
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure, // true for HTTPS
      sameSite, // "lax" for Vercel cross-domain requests
      maxAge: options?.refreshTokenMaxAge ?? 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Optionally include accessToken in response body for frontend use
    if (options?.includeAccessTokenInBody) {
      res.json({ accessToken: tokens.accessToken });
    }
  }

  /**
   * Clears authentication cookies.
   *
   * @param res - Express Response object.
   * @param options - Optional configuration overrides.
   */
  static clearAuthCookies(
    res: Response,
    options?: { secure?: boolean; sameSite?: "strict" | "lax" | "none" }
  ): void {
    // Hardcode secure: true for Vercel's HTTPS environment
    const secure = options?.secure ?? true;
    // Default to "lax" for cross-site compatibility
    const sameSite = options?.sameSite ?? "lax";

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure, // true for HTTPS
      sameSite, // "lax" for Vercel
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure, // true for HTTPS
      sameSite, // "lax" for Vercel
    });
  }

  /**
   * Returns common cookie options for the access token.
   */
  static getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: true, // Hardcode true for Vercel's HTTPS
      sameSite: "lax", // Hardcode "lax" for cross-site compatibility
      maxAge: 30 * 60 * 1000, // 30 minutes
    };
  }
}