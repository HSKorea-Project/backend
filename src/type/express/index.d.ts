import 'express-session';

declare module 'express-serve-static-core' {
  interface Request {
    session: Session & Partial<SessionData> & { userId?: number };
  }
}

declare module 'express-session' {
    interface SessionData {
        user?: {
            role: string;
        };
        inquiryAuth?: Record<string, boolean>;
    }
}