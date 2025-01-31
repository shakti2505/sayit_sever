// Search user by name or email id
import UserContactModal from "../modals/userContactsModal.js";
import UserModal from "../modals/userModal.js";
export const searchUser = async (req, res) => {
  try {
    const { name, email } = req.query;

    // Validate query parameters
    if (!name && !email) {
      return res.status(400).json({
        message: "Please provide either 'name' or 'email' to search.",
      });
    }

    // Build query object
    const query = {};
    if (name) {
      query.name = { $regex: name, $options: "i" }; // Case-insensitive search
    }
    if (email) {
      query.email = email; // Exact match
    }

    // Execute query
    const users = await UserModal.find(query);

    // Check if users are found
    if (users.length > 0) {
      return res.status(200).json({ message: "Users found", data: users });
    } else {
      return res
        .status(404)
        .json({ message: "No users found with the given criteria." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addNewContact = async (req, res) => {
  try {
    const user = req.user;
    const {
      contact_id,
      contact_name,
      contact_image,
      contact_email,
      contact_public_key,
    } = req.body;

    // Validate required fields
    if (
      !user._id ||
      !contact_id ||
      !contact_email ||
      !contact_image ||
      !contact_name ||
      !contact_public_key
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Save contact to database
    await UserContactModal.create({
      user_id: user._id,
      contact_id,
      contact_name,
      contact_image,
      contact_email,
      contact_public_key,
    });

    return res.status(201).json({ message: "Contact saved successfully" });
  } catch (error) {
    console.error("Error adding new contact:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllContactByUserId = async (req, res) => {
  try {
    const user = req.user;
    if (!user._id) {
      return res.status(400).json({ message: "No user found" });
    }

    const allContacts = await UserContactModal.find({ user_id: user._id });
    return res
      .status(200)
      .json({ message: "Contact found", data: allContacts });
  } catch (error) {
    console.log("error in finding contacts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
