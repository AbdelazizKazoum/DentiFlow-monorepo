import {Repository} from "typeorm";
import {BaseRepository} from "./base.repository";

interface TestEntity {
  id: string;
  clinic_id: string;
  name: string;
}

class TestRepository extends BaseRepository<TestEntity> {
  constructor(repo: Repository<TestEntity>) {
    super(repo);
  }
}

function createMockRepo(): jest.Mocked<Repository<TestEntity>> {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  } as unknown as jest.Mocked<Repository<TestEntity>>;
}

describe("BaseRepository", () => {
  let mockRepo: jest.Mocked<Repository<TestEntity>>;
  let repository: TestRepository;

  const CLINIC_ID = "clinic-123";
  const ENTITY_ID = "entity-456";

  beforeEach(() => {
    mockRepo = createMockRepo();
    repository = new TestRepository(mockRepo);
  });

  describe("findById", () => {
    it("should include clinic_id in the WHERE clause", async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await repository.findById(ENTITY_ID, CLINIC_ID);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: {id: ENTITY_ID, clinic_id: CLINIC_ID},
      });
    });

    it("should return the entity when found", async () => {
      const entity: TestEntity = {
        id: ENTITY_ID,
        clinic_id: CLINIC_ID,
        name: "Test",
      };
      mockRepo.findOne.mockResolvedValue(entity);

      const result = await repository.findById(ENTITY_ID, CLINIC_ID);

      expect(result).toBe(entity);
    });

    it("should return null when entity not found", async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await repository.findById(ENTITY_ID, CLINIC_ID);

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should include clinic_id in the WHERE clause", async () => {
      mockRepo.find.mockResolvedValue([]);

      await repository.findAll(CLINIC_ID);

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: {clinic_id: CLINIC_ID},
      });
    });

    it("should merge extra options while keeping clinic_id in WHERE", async () => {
      mockRepo.find.mockResolvedValue([]);

      await repository.findAll(CLINIC_ID, {take: 10, skip: 0});

      expect(mockRepo.find).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        where: {clinic_id: CLINIC_ID},
      });
    });

    it("should return all matching entities", async () => {
      const entities: TestEntity[] = [
        {id: "1", clinic_id: CLINIC_ID, name: "A"},
        {id: "2", clinic_id: CLINIC_ID, name: "B"},
      ];
      mockRepo.find.mockResolvedValue(entities);

      const result = await repository.findAll(CLINIC_ID);

      expect(result).toBe(entities);
    });
  });

  describe("save", () => {
    it("should save the entity via the underlying repository", async () => {
      const entity: TestEntity = {
        id: ENTITY_ID,
        clinic_id: CLINIC_ID,
        name: "Test",
      };
      mockRepo.save.mockResolvedValue(entity);

      const result = await repository.save(entity);

      expect(mockRepo.save).toHaveBeenCalledWith(entity);
      expect(result).toBe(entity);
    });
  });

  describe("delete", () => {
    it("should include both id and clinic_id in the delete criteria", async () => {
      mockRepo.delete.mockResolvedValue({affected: 1, raw: {}});

      await repository.delete(ENTITY_ID, CLINIC_ID);

      expect(mockRepo.delete).toHaveBeenCalledWith({
        id: ENTITY_ID,
        clinic_id: CLINIC_ID,
      });
    });
  });

  describe("count", () => {
    it("should include clinic_id in the WHERE clause", async () => {
      mockRepo.count.mockResolvedValue(5);

      await repository.count(CLINIC_ID);

      expect(mockRepo.count).toHaveBeenCalledWith({
        where: {clinic_id: CLINIC_ID},
      });
    });

    it("should return the count", async () => {
      mockRepo.count.mockResolvedValue(42);

      const result = await repository.count(CLINIC_ID);

      expect(result).toBe(42);
    });
  });
});
