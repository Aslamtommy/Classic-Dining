 
export class AppError extends Error {
    constructor(public status: number, message: string,public data?: any) {
      super(message);
      this.name = 'AppError';
    }
  }