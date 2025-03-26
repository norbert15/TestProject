import { randomUUID } from 'crypto';

export class MockStudentRepositroy<T> {
  constructor(private idKey = 'id') {
    this.idKey = idKey;
  }

  private entities: T[] = [];

  find(): Promise<T[]> {
    return Promise.resolve(this.entities);
  }

  findOneBy(where: Partial<T>): Promise<T | null> {
    return Promise.resolve(
      this.entities.find((item) => this.findByObjectEntries(where, item)) ??
        null,
    );
  }

  save(entity: T): Promise<T> {
    this.entities.push({ ...entity });
    return Promise.resolve({ ...entity });
  }

  create(entity: T): T {
    const createdEntity = { ...entity };
    createdEntity[this.idKey] = randomUUID();

    return { ...createdEntity };
  }

  remove(entity: T): Promise<string> {
    const entityIndex = this.entities.findIndex((item) =>
      this.findByObjectEntries(entity, item),
    );

    if (entityIndex !== -1) {
      this.entities.splice(entityIndex, 1);
    }

    return Promise.resolve(entity[this.idKey]);
  }

  update(entity: T): Promise<T> {
    const entityIndex = this.entities.findIndex((item) =>
      this.findByObjectEntries(entity, item),
    );

    if (entityIndex !== -1) {
      this.entities[entityIndex] = { ...entity };
    }

    return Promise.resolve({ ...entity });
  }

  private findByObjectEntries(where: Partial<T>, item: T) {
    return Object.entries(where).every(([key, value]) => item[key] === value);
  }
}
