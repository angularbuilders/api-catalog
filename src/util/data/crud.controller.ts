import * as express from 'express';
import { Repository } from '../../models/Repository';
import { isForbidden, setId, setOwner } from '../app/auth';
import {
  sendConflict,
  sendCreated,
  sendEmpty,
  sendForbidden,
  sendNotFound,
  sendSuccess,
  sendUnprocessable,
} from '../app/responseSenders';
import { rootConfig } from '../config';

export async function get<T>(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
  repository: Repository<T>
): Promise<void> {
  try {
    const result = await repository.select();
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getById<T>(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
  repository: Repository<T>
): Promise<void> {
  try {
    const id = req.params.id;
    const result = await repository.selectById(id);
    if (result) {
      sendSuccess(res, result);
    } else {
      sendNotFound(res);
    }
  } catch (err) {
    next(err);
  }
}

export async function post<T>(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
  repository: Repository<T>,
  validate?: (T) => boolean,
  afterInserted?: (T) => {}
): Promise<void> {
  try {
    const toAdd = req.body;
    if (validate) {
      if (validate(toAdd) === false) {
        sendUnprocessable(res);
        return;
      }
    }
    setId(req, toAdd);
    setOwner(req, toAdd);
    const added = await repository.insert(toAdd);
    if (added) {
      if (afterInserted) {
        afterInserted(added);
      }
      sendCreated(res, added);
    } else {
      sendConflict(res);
    }
  } catch (err) {
    next(err);
  }
}

export async function put<T>(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
  repository: Repository<T>
): Promise<void> {
  try {
    const id = req.params.id;
    const toUpdate = await repository.selectById(id);
    if (!toUpdate) return sendNotFound(res);
    const origin = req.get('origin');
    if (origin !== rootConfig.clientDomain) {
      console.log(`${origin} not equal to ${rootConfig.clientDomain}`);
      return sendForbidden(res);
    }
    // if (isForbidden(req, toUpdate)) {
    //   return sendForbidden(res);
    // }
    const payload = req.body;
    payload.id = toUpdate['id'];
    payload.ownerId = toUpdate['ownerId'];
    const updated = await repository.update(id, payload);
    sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

export async function remove<T>(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
  repository: Repository<T>
): Promise<void> {
  try {
    const id = req.params.id;
    const toDelete = await repository.selectById(id);
    if (!toDelete) return sendNotFound(res);
    if (isForbidden(req, toDelete)) {
      return sendForbidden(res);
    }
    await repository.delete(id);
    sendEmpty(res);
  } catch (err) {
    next(err);
  }
}
