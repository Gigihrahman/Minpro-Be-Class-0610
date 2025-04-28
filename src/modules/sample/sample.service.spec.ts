import { createMockContext, MockContext, Context } from "../../../test/context";
import { SampleService } from "./sample.service";

describe("sampleService", () => {
  let mockCtx: MockContext;
  let ctx: Context;
  let sampleService: SampleService;

  beforeEach(() => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    sampleService = new SampleService(mockCtx.prisma);
  });

  describe("getSamples", () => {
    it("should return all samples", async () => {
      const mockSamples = [
        { id: 1, name: "mock1", createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: "mock2", createdAt: new Date(), updatedAt: new Date() },
        { id: 3, name: "mock3", createdAt: new Date(), updatedAt: new Date() },
      ];

      mockCtx.prisma.sample.findMany.mockResolvedValue(mockSamples);

      const result = await sampleService.getSamples();

      expect(result).toEqual(mockSamples);
    });
  });

  describe("getSample", () => {
    it("should return sample", async () => {
      const mockSample = {
        id: 1,
        name: "mock1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.prisma.sample.findFirst.mockResolvedValueOnce(mockSample);

      const result = await sampleService.getSample(mockSample.id);

      expect(result).toEqual(mockSample);
    });
    it("should throw error if sample not found", async () => {
      const mockSampleId = -1;

      mockCtx.prisma.sample.findFirst.mockResolvedValueOnce(null);

      expect(sampleService.getSample(mockSampleId)).rejects.toThrow(
        "Sample not found"
      );
    });
  });

  describe("createSample", () => {
    it("should create sample succesfully", async () => {
      const mockSample = {
        id: 1,
        name: "mock1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.prisma.sample.create.mockResolvedValueOnce(mockSample);
      const result = await sampleService.createSample(mockSample);
      expect(result).toBe(mockSample);
    });
  });
  //isi describe baru
});
