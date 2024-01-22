import type { Config } from "jest";

const config: Config = {
    verbose: true,
    coverageProvider: "v8",
    preset: "ts-jest",
    testEnvironment: "jsdom",
};

export default config;
