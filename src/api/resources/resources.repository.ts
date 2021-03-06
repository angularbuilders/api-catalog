import { MongoRepository } from '../../util/data/MongoRepository';
import { Resource } from './resource';

export class ResourcesMongoRepository extends MongoRepository<Resource> {
  constructor() {
    super('resources');
  }
  public async selectByCategoryId(id: string): Promise<Resource[]> {
    return this.selectByQuery({ categoryId: id }, { id: 1, name: 1, description: 1 });
  }
  public countByCategoryId(id: string): Promise<number> {
    return this.countByQuery({ categoryId: id });
  }
}
