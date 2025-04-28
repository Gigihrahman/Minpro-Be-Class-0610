import { App } from "../../../src/app";
import { PrismaService } from "../../../src/modules/prisma/prisma.service";
import request from "supertest";

describe("GET /samples", () => {
  const { app } = new App();
  const prisma = new PrismaService();
  it("Should display samples", async () => {
    const mockSampleData = [
      { name: "test1" },
      { name: "test2" },
      { name: "test3" },
      { name: "test4" },
    ];
    await prisma.sample.createMany({
      data: mockSampleData,
    });
    const response = await request(app).get("/samples");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4);
  });
});
