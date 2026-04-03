declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
export declare class EnvironmentVariables {
    NODE_ENV: Environment;
    PORT: number;
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    JWT_SECRET: string;
    JWT_EXPIRATION: string;
    OPENAI_API_KEY: string;
    ENCRYPTION_KEY: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    MAX_APPLICATIONS_PER_HOUR: number;
    MAX_APPLICATIONS_PER_DAY: number;
    MIN_DELAY_SECONDS: number;
    MAX_DELAY_SECONDS: number;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
