// Core IQ Test Types
export interface IQQuestion {
  readonly id: number;
  category: QuestionCategory;
  type: QuestionType;
  difficulty: DifficultyLevel;
  timeLimit: number; // seconds
  question: string; // HTML content
  options: readonly string[]; // HTML content for each option
  correct: number; // index of correct answer (0-based)
  explanation: string;
  patternRules?: readonly PatternRule[];
  visualComplexity?: VisualComplexity; // 1-10 scale
  logicSteps?: number; // number of reasoning steps required
  metadata?: QuestionMetadata;
}

export type QuestionCategory = 
  | 'Pattern Recognition' 
  | 'Spatial Reasoning' 
  | 'Logical Deduction' 
  | 'Mathematical Patterns' 
  | 'Visual Memory' 
  | 'Advanced Pattern Recognition';

export type QuestionType = 
  | 'matrix' 
  | 'sequence' 
  | 'analogy' 
  | 'completion' 
  | 'transformation';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export type VisualComplexity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface PatternRule {
  readonly type: PatternRuleType;
  description: string;
  complexity: DifficultyLevel;
  parameters: Record<string, unknown>;
}

export type PatternRuleType = 
  | 'rotation' 
  | 'reflection' 
  | 'progression' 
  | 'symmetry' 
  | 'alternation' 
  | 'recursion' 
  | 'xor' 
  | 'arithmetic' 
  | 'transformation';

export interface QuestionMetadata {
  tags?: readonly string[];
  source?: string;
  version?: string;
  lastModified?: Date;
}

// User and Authentication Types
export interface User {
  readonly id: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  readonly createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  readonly id: string;
  readonly userId: string;
  email: string;
  testHistory: readonly TestSession[];
  averageScore: number;
  bestScore: number;
  totalTests: number;
  readonly memberSince: Date;
  preferences: UserPreferences;
  analytics?: UserAnalytics;
}

export interface UserPreferences {
  theme: ThemeType;
  language: string;
  notifications: boolean;
  emailUpdates: boolean;
  accessibility?: AccessibilitySettings;
}

export type ThemeType = 'light' | 'dark' | 'auto';

export interface AccessibilitySettings {
  highContrast?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
  screenReader?: boolean;
  reducedMotion?: boolean;
}

// Test Session Types
export interface TestSession {
  readonly id: string;
  userId?: string;
  email?: string;
  readonly startTime: Date;
  endTime?: Date;
  answers: readonly Answer[];
  score?: number;
  timeSpent: number;
  paymentStatus: PaymentStatus;
  testType: TestType;
  ipAddress?: string;
  userAgent?: string;
  metadata?: TestMetadata;
}

export type PaymentStatus = 'pending' | 'completed' | 'locked' | 'refunded';

export type TestType = 'free' | 'premium' | 'demo';

export interface Answer {
  questionId: number;
  selectedOption: number;
  timeSpent: number;
  isCorrect: boolean;
  readonly timestamp: Date;
  confidence?: ConfidenceLevel;
}

export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface TestMetadata {
  browser?: string;
  device?: string;
  screenResolution?: string;
  timezone?: string;
  referrer?: string;
}

export interface TestProgress {
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
  answeredQuestions: Set<number>;
  confidence: ConfidenceLevel;
  currentStreak?: number;
  longestStreak?: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ErrorResponse extends ApiResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Database Types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  connectTimeout?: number;
  commandTimeout?: number;
}

// Payment Types
export interface PaymentIntent {
  readonly id: string;
  amount: number;
  currency: Currency;
  status: PaymentIntentStatus;
  clientSecret: string;
  metadata: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export type PaymentIntentStatus = 
  | 'requires_payment_method' 
  | 'requires_confirmation' 
  | 'requires_action' 
  | 'processing' 
  | 'requires_capture' 
  | 'canceled' 
  | 'succeeded';

export interface PaymentRequest {
  testSessionId: string;
  amount: number;
  currency: Currency;
  email: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

// Security Types
export interface JWTPayload {
  readonly userId: string;
  email: string;
  readonly iat: number;
  readonly exp: number;
  type: TokenType;
  permissions?: readonly string[];
}

export type TokenType = 'access' | 'refresh' | 'reset' | 'verification';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Error Types
export interface AppError extends Error {
  readonly statusCode: number;
  readonly isOperational: boolean;
  readonly code?: string;
  readonly timestamp: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
  code?: string;
}

export interface ErrorDetails {
  code: string;
  message: string;
  field?: string;
  value?: unknown;
  stack?: string;
}

// Environment Types
export interface Environment {
  readonly NODE_ENV: EnvironmentType;
  readonly PORT: number;
  readonly DATABASE_URL: string;
  readonly REDIS_URL: string;
  readonly JWT_SECRET: string;
  readonly JWT_REFRESH_SECRET: string;
  readonly STRIPE_SECRET_KEY: string;
  readonly STRIPE_WEBHOOK_SECRET: string;
  readonly EMAIL_HOST: string;
  readonly EMAIL_PORT: number;
  readonly EMAIL_USER: string;
  readonly EMAIL_PASS: string;
  readonly FRONTEND_URL: string;
  readonly API_URL: string;
  readonly LOG_LEVEL?: LogLevel;
}

export type EnvironmentType = 'development' | 'production' | 'test';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Logging Types
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  metadata?: Record<string, unknown>;
  error?: Error;
  requestId?: string;
  userId?: string;
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
}

// Analytics Types
export interface TestAnalytics {
  totalTests: number;
  averageScore: number;
  scoreDistribution: Record<string, number>;
  averageTimeSpent: number;
  completionRate: number;
  difficultyBreakdown: Record<DifficultyLevel, number>;
  categoryPerformance: Record<QuestionCategory, number>;
  timeOfDayDistribution?: Record<string, number>;
  deviceTypeDistribution?: Record<string, number>;
}

export interface UserAnalytics {
  readonly userId: string;
  testCount: number;
  averageScore: number;
  improvementTrend: number;
  strengths: readonly QuestionCategory[];
  weaknesses: readonly QuestionCategory[];
  recommendedFocus: readonly QuestionCategory[];
  progressHistory?: readonly ProgressPoint[];
}

export interface ProgressPoint {
  date: Date;
  score: number;
  testType: TestType;
}

// Question Generation Types
export interface QuestionGenerator {
  generateQuestion(difficulty: DifficultyLevel, category: QuestionCategory): IQQuestion;
  validateQuestion(question: IQQuestion): boolean;
  getQuestionPool(difficulty: DifficultyLevel, category: QuestionCategory): readonly IQQuestion[];
  getRandomQuestions(count: number, difficulty?: DifficultyLevel, category?: QuestionCategory): readonly IQQuestion[];
}

// Cache Types
export interface CacheConfig {
  ttl: number; // time to live in seconds
  prefix: string;
  serialize: boolean;
  maxSize?: number;
  evictionPolicy?: EvictionPolicy;
}

export type EvictionPolicy = 'LRU' | 'LFU' | 'FIFO' | 'TTL';

export interface CacheEntry<T> {
  readonly key: string;
  value: T;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  accessCount?: number;
  lastAccessed?: Date;
}

// Utility Types
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type NonEmptyArray<T> = [T, ...T[]];

export type Timestamp = number;

export type UUID = string;

// Event Types
export interface DomainEvent {
  readonly id: string;
  readonly type: string;
  readonly timestamp: Date;
  readonly data: Record<string, unknown>;
  readonly version: number;
}

export interface TestEvent extends DomainEvent {
  readonly type: 'test.started' | 'test.completed' | 'test.abandoned';
  readonly data: {
    testId: string;
    userId?: string;
    email?: string;
  };
}

// Configuration Types
export interface AppConfig {
  server: ServerConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  security: SecurityConfig;
  logging: LoggingConfig;
  features: FeatureFlags;
}

export interface ServerConfig {
  port: number;
  host: string;
  cors: CorsConfig;
  rateLimit: RateLimitConfig;
}

export interface CorsConfig {
  origin: string | string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}

export interface SecurityConfig {
  jwt: JWTConfig;
  bcrypt: BcryptConfig;
  helmet: HelmetConfig;
}

export interface JWTConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface BcryptConfig {
  saltRounds: number;
}

export interface HelmetConfig {
  contentSecurityPolicy: boolean;
  crossOriginEmbedderPolicy: boolean;
}

export interface LoggingConfig {
  level: LogLevel;
  format: 'json' | 'simple';
  transports: LogTransport[];
}

export interface LogTransport {
  type: 'console' | 'file' | 'remote';
  config: Record<string, unknown>;
}

export interface FeatureFlags {
  enableAnalytics: boolean;
  enablePayments: boolean;
  enableEmailNotifications: boolean;
  enableAdvancedQuestions: boolean;
  enableUserProfiles: boolean;
}

// Additional types for server.ts
export interface HealthCheckData {
  status: string;
  uptime: number;
  environment: EnvironmentType;
  version: string;
  timestamp: string;
  memory: NodeJS.MemoryUsage;
  pid: number;
  nodeVersion: string;
  platform: string;
  arch: string;
}

export interface MetricsData {
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  uptime: number;
  pid: number;
  nodeVersion: string;
  platform: string;
  arch: string;
  loadAverage?: number[];
}

export interface ApiInfoData {
  name: string;
  version: string;
  environment: EnvironmentType;
  endpoints: Record<string, string>;
  status: string;
  documentation?: string;
  support?: string;
}
