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
      includeAccessTokenInBody?: boolean;
    }
  ): void {
    const secure = options?.secure ?? true;
    const sameSite = options?.sameSite ?? "none"; // Changed to "none" for cross-domain

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: options?.accessTokenMaxAge ?? 30 * 60 * 1000, // 30 minutes
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: options?.refreshTokenMaxAge ?? 7 * 24 * 60 * 60 * 1000, // 7 days
    });

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
    const secure = options?.secure ?? true;
    const sameSite = options?.sameSite ?? "none"; // Changed to "none"

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure,
      sameSite,
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure,
      sameSite,
    });
  }

  /**
   * Returns common cookie options for the access token.
   */
  static getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: true,
      sameSite: "none", // Changed to "none"
      maxAge: 30 * 60 * 1000, // 30 minutes
    };
  }
}