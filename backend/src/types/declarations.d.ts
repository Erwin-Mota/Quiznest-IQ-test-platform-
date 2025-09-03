// Type declarations for modules without TypeScript support

declare module 'express-slow-down' {
  import { Request, Response, NextFunction } from 'express';
  
  interface SlowDownOptions {
    windowMs?: number;
    delayAfter?: number;
    delayMs?: number;
    maxDelayMs?: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    keyGenerator?: (req: Request) => string;
    skip?: (req: Request, res: Response) => boolean;
    onLimitReached?: (req: Request, res: Response, options: SlowDownOptions) => void;
  }
  
  function slowDown(options?: SlowDownOptions): (req: Request, res: Response, next: NextFunction) => void;
  export = slowDown;
}

declare module 'hpp' {
  import { Request, Response, NextFunction } from 'express';
  
  interface HppOptions {
    checkBody?: boolean;
    checkBodyOnlyForContentType?: string[];
    checkQuery?: boolean;
    whitelist?: string[];
  }
  
  function hpp(options?: HppOptions): (req: Request, res: Response, next: NextFunction) => void;
  export = hpp;
}

declare module 'xss-clean' {
  import { Request, Response, NextFunction } from 'express';
  
  interface XssCleanOptions {
    whiteList?: Record<string, string[]>;
    stripIgnoreTag?: boolean;
    stripIgnoreTagBody?: string[];
    css?: boolean | Record<string, any>;
  }
  
  function xss(options?: XssCleanOptions): (req: Request, res: Response, next: NextFunction) => void;
  export = xss;
}

declare module './middleware/securityMiddleware' {
  export function securityMiddleware(): any;
}

declare module './config/database' {
  export function databaseConnection(): Promise<void>;
}

declare module './config/redis' {
  export function redisConnection(): Promise<void>;
}

declare module './routes/auth' {
  import { Router } from 'express';
  const router: Router;
  export default router;
}

declare module './routes/users' {
  import { Router } from 'express';
  const router: Router;
  export default router;
}

declare module './routes/questions' {
  import { Router } from 'express';
  const router: Router;
  export default router;
}

declare module './routes/tests' {
  import { Router } from 'express';
  const router: Router;
  export default router;
}

declare module './routes/results' {
  import { Router } from 'express';
  const router: Router;
  export default router;
}

declare module './routes/payments' {
  import { Router } from 'express';
  const router: Router;
  export default router;
}

declare module './routes/admin' {
  import { Router } from 'express';
  const router: Router;
  export default router;
}
