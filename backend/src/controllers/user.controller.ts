import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const handleGetMyInfo = async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUserInfo(req.user!.id);

    res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

const UserController = {
  handleGetMyInfo,
};

export { UserController };
