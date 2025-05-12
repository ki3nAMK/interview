import { access, readFileSync } from 'fs';
import * as joi from 'joi';
import { load } from 'js-yaml';

export interface Configuration {
  port: number;
  api_docs_path: string;
  is_production: boolean;
  redis: {
    host: string;
    port: number;
    password: string;
    db: number;
  };
  mongo: {
    uri: string;
    port: number;
    db: string;
  };
  jwt: {
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
  };
}

const redisSchema = joi.object({
  host: joi.string().required(),
  port: joi.number().required(),
  db: joi.number().required(),
  password: joi.string().required().allow(''),
});

const mongoSchema = joi.object({
  uri: joi.string().required(),
  port: joi.number().required(),
  db: joi.string().required(),
});

const jwtSchema = joi.object({
  accessTokenExpiresIn: joi.number().required(),
  refreshTokenExpiresIn: joi.number().required(),
});

const configSchema = joi.object({
  port: joi.number().required(),
  api_docs_path: joi.string().required(),
  is_production: joi.boolean().required(),
  redis: redisSchema.required(),
  mongo: mongoSchema.required(),
  jwt: jwtSchema.required(),
});

export const loadConfiguration = (): Configuration => {
  const config = load(readFileSync('config.yml', 'utf8')) as Record<
    string,
    any
  >;

  const { value, error } = configSchema.validate(config, { abortEarly: true });

  if (error) {
    throw new Error(error.message);
  }

  return value;
};
