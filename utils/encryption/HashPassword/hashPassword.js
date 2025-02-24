import crypto from "crypto";
// hash password

export const hashPassword = (
  password,
  salt = crypto.randomBytes(16).toString("hex")
) => {
  // generate random to salt to add in the the password to maintain the uniqueness
  // hash password using password based key derivation method with 100,000+ iteration
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      resolve({ hash: derivedKey.toString("hex"), salt });
    });
  });
};

export const verifyPassword = async (password, storedHash, storedSalt) => {
  // generating the hash again with password and hash stored in database
  const { hash } = await hashPassword(password, storedSalt);
  // comparing the stored hash with current password hash to match the password;
  return hash === storedHash;
};
