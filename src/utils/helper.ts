import {
  isArray,
  isDate,
  isFunction,
  isObject,
  isString,
  keys,
  map,
  reduce,
  trim,
} from 'lodash';
import { Document, Types } from 'mongoose';

export const currentTime = () => new Date();

export const isJson = (val: unknown) => {
  try {
    if (typeof val === 'string') {
      JSON.parse(val);
    } else {
      JSON.parse(JSON.stringify(val));
    }

    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
};

export const toObjectId = (id: string | Types.ObjectId) => {
  if (id instanceof Types.ObjectId) {
    return id;
  }

  return new Types.ObjectId(id);
};

export const objectIdToString = (val: Types.ObjectId | string) => {
  if (val instanceof Types.ObjectId) return val.toString();
  return val;
};

export const convertObjectIdToString = (val: any) => {
  if (val instanceof Document) return convertObjectIdToString(val.toObject());

  if (val instanceof Types.ObjectId) return val.toString();

  if (isFunction(val) || isDate(val) || !isObject(val)) return val;

  if (isArray(val)) return map(val, convertObjectIdToString);

  return reduce(
    keys(val),
    (prev: any, key) => ({ ...prev, [key]: convertObjectIdToString(val[key]) }),
    {},
  );
};

export const isValidEmail = (value: string) => {
  const email = trim(value);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (value) => {
  const phone = trim(value);
  const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
  return phoneRegex.test(phone);
};
