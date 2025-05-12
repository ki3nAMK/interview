import { ObjectId } from 'mongoose';

export interface CreateEntityResponse<T> {
  item?: T;
  _id: ObjectId;
}
