import { injectable } from "tsyringe";
import { CategoryService } from "./category.service";
import { NextFunction, Request, Response } from "express";

@injectable()
export class CategoryController {
  private categoryService: CategoryService;
  constructor(CategoryService: CategoryService) {
    this.categoryService = CategoryService;
  }

  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.categoryService.getCategories();
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
