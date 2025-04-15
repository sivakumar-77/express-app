import express, { Application, Request, Response, NextFunction } from "express";
const app: Application = express();
const port = 3000;
import dotenv from "dotenv";
import logger from "./logger/winston.logger";
import { asyncHandler } from "./utils/asyncHandler";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config({
  path: "./.env",
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req: Request, res: Response): any => {
  return res.status(200).send({ message: `Welcome to the Express API` })
})


import userRouter from "./routes/user.route";
import chatRouter from "./routes/chat.route";

app.use("/user", userRouter);
app.use("/chat", chatRouter);
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});
try {
  app.listen(port, () => {
    logger.info(`📑 Visit the documentation at: http://localhost:${port}`);
    logger.info("⚙️  Server is running on port: " + port);
  });
} catch (error: any) {
  console.log(`Error occurred: ${error.message}`);
}
