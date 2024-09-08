import config from './config.json' assert { type: "json" };

const ENVIRONMENT = 'ENVIRONMENT';
const ENVIRONMENTS = {
    DEV: 'development',
    PROD: 'production'
};

const setEnvConfigs = (env) => {
    console.log(`Setting up environment | ENV : ${env}`);
    const envConfig = config[env];
    process.env[ENVIRONMENT] = env;
    Object.keys(envConfig).forEach(key => {
        process.env[key] = envConfig[key];
    });
};

const env = process.env.NODE_ENV || ENVIRONMENTS.DEV;
setEnvConfigs(env);

export default {
    ENVIRONMENTS
};
