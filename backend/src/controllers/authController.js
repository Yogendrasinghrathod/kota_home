import User from "../models/User.js";

export const loginUser = async (req, res) => {
  try {
    const { uid, phone_number } = req.user;

    let user = await User.findOne({
      firebaseUid: uid,
    });

    // First login
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        phone: phone_number,
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
