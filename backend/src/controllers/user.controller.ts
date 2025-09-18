import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const handleGetMyInfo = async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUserInfo(req.user!.id);

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error while getting user info" });
  }
};

const UserController = {
  handleGetMyInfo,
};

export { UserController };
