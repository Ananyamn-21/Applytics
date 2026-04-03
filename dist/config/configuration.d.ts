declare const _default: () => {
    port: number;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
    };
    jwt: {
        secret: string;
        expiration: string;
    };
    gemini: {
        apiKey: string;
    };
    encryption: {
        key: string;
    };
    redis: {
        host: string;
        port: number;
    };
    autoApply: {
        maxApplicationsPerHour: number;
        maxApplicationsPerDay: number;
        minDelaySeconds: number;
        maxDelaySeconds: number;
    };
};
export default _default;
