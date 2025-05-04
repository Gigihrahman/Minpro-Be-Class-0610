import { Router } from "express";

import { injectable } from "tsyringe";
import { CategoryController } from "./category.controller";

@injectable()
export class CategoryRouter {
  private router: Router;
  private categoryController: CategoryController;
  constructor(CategoryController: CategoryController) {
    this.router = Router();
    this.categoryController = CategoryController;
    this.initialzeRouter();
  }
  private initialzeRouter() {
    this.router.get("/", this.categoryController.getCategories);
  }

  getRouter() {
    return this.router;
  }
}
