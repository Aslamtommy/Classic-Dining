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
    }
  ): void {
    const secure = options?.secure ?? process.env.NODE_ENV === "production";
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: options?.sameSite ?? "strict",
      maxAge: options?.accessTokenMaxAge ?? 10 * 60 * 1000, // default: 10 minutes
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: options?.sameSite ?? "strict",
      maxAge: options?.refreshTokenMaxAge ?? 7 * 24 * 60 * 60 * 1000, // default: 7 days
    });
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
    const secure = options?.secure ?? process.env.NODE_ENV === "production";
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure,
      sameSite: options?.sameSite ?? "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure,
      sameSite: options?.sameSite ?? "strict",
    });
  }

  /**
   * Returns common cookie options for the access token.
   */
  static getCookieOptions(): CookieOptions {
    const secure = process.env.NODE_ENV === "production";
    return {
      httpOnly: true,
      secure,
      sameSite: "strict",
      maxAge: 10 * 60 * 1000, // default: 10 minutes
    };
  }
}
