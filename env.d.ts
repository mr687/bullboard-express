declare module NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production';
		PORT: string;

		// BULL-BOARD OPTIONS
		BOARD_BASE_PATH: string;

		// REDIS OPTIONS
		REDIS_HOST: string;
		REDIS_PORT: string;
		REDIS_USERNAME: string;
		REDIS_PASSWORD: string;
		REDIS_TLS: string;

		// BULL QUEUE OPTIONS
		BULL_QUEUE_PREFIX: string;
		BULL_QUEUE_NAMES: string;

		// BASIC AUTH LOCAL CREDENTIALS
		USER_NAME: string
		USER_PASSWORD: string
	}
}