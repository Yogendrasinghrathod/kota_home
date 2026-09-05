import User from "../models/User.js";
import { firebaseAuth } from "../config/firebaseAdmin.js";

const PHONE_EMAIL_USER_URL = "https://eapi.phone.email/getuser";

const toE164 = (countryCode, phoneNo) => {
  const cc = String(countryCode || "").replace(/\D/g, "");
  const num = String(phoneNo || "").replace(/\D/g, "");
  if (!cc || !num) return null;
  return `+${cc}${num}`;
};

const getOrCreateFirebaseUser = async (phone) => {
  try {
    const existing = await firebaseAuth.getUserByPhoneNumber(phone);
    return existing.uid;
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }
  }

  const uid = `phone-${phone.replace(/\D/g, "")}`;

  try {
    await firebaseAuth.createUser({ uid, phoneNumber: phone });
    return uid;
  } catch (error) {
    if (error.code === "auth/uid-already-exists") {
      await firebaseAuth.updateUser(uid, { phoneNumber: phone });
      return uid;
    }
    throw error;
  }
};

export const exchangePhoneEmailToken = async (req, res) => {
  try {
    const { access_token, user_json_url } = req.body;
    const clientId = process.env.PHONE_EMAIL_CLIENT_ID;

    if (!clientId) {
      return res.status(500).json({
        message: "Phone.Email is not configured on the server",
      });
    }

    let phone = null;

    if (user_json_url) {
      let parsedUrl;
      try {
        parsedUrl = new URL(user_json_url);
      } catch {
        return res.status(400).json({
          message: "Invalid Phone.Email user URL",
        });
      }

      if (
        parsedUrl.protocol !== "https:" ||
        parsedUrl.hostname !== "user.phone.email"
      ) {
        return res.status(400).json({
          message: "Invalid Phone.Email user URL",
        });
      }

      const jsonResponse = await fetch(parsedUrl.href);
      const userInfo = await jsonResponse.json();
      phone = toE164(
        userInfo.user_country_code || userInfo.country_code,
        userInfo.user_phone_number || userInfo.phone_no
      );
    } else if (access_token) {
      const form = new FormData();
      form.append("access_token", access_token);
      form.append("client_id", clientId);

      const phoneEmailResponse = await fetch(PHONE_EMAIL_USER_URL, {
        method: "POST",
        body: form,
      });

      const payload = await phoneEmailResponse.json();

      if (Number(payload.status) !== 200) {
        return res.status(401).json({
          message: "Phone.Email verification failed",
        });
      }

      phone = toE164(payload.country_code, payload.phone_no);
    } else {
      return res.status(400).json({
        message: "user_json_url or access_token is required",
      });
    }

    if (!phone) {
      return res.status(400).json({
        message: "Verified phone number missing",
      });
    }

    const uid = await getOrCreateFirebaseUser(phone);
    const customToken = await firebaseAuth.createCustomToken(uid);

    return res.status(200).json({
      customToken,
      phone,
    });
  } catch (error) {
    console.error("Phone.Email exchange error:", error.message);

    return res.status(500).json({
      message: "Failed to complete phone login",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { uid, phone_number } = req.user;
    const { role } = req.body;

    let user = await User.findOne({
      firebaseUid: uid,
    });

    if (!user && phone_number) {
      user = await User.findOne({ phone: phone_number });

      if (user) {
        user.firebaseUid = uid;
        await user.save();
      }
    }

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        phone: phone_number,
        role: role || "STUDENT",
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

export const getCurrentUser = async (req, res) => {
  try {
    const { uid, phone_number } = req.user;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user && phone_number) {
      user = await User.findOne({ phone: phone_number });

      if (user) {
        user.firebaseUid = uid;
        await user.save();
      }
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { name: name.trim() },
      { returnDocument: "after" }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
