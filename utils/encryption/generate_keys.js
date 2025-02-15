import crypto from "crypto";
// generating random AES key

export const generateAESkey = async () => {
  const key = crypto.randomBytes(32); // 32 bytes  = 256 bits;
  return exportAESkey(key);
};
  
export const exportAESkey = (aesKey) => {
  return Buffer.from(aesKey);
};

const base64ToPEM = (base64Key) => {
  const formattedBase64 = base64Key.match(/.{1,64}/g)?.join("\n");
  return `-----BEGIN PUBLIC KEY-----\n${formattedBase64}\n-----END PUBLIC KEY-----`;
};

// encrypt the AES key wity user's public key
const encryptAESKeyWithPublicKey = (aesKeyBuffer, UserPublicKey) => {
  const public_key = base64ToPEM(UserPublicKey);

  return crypto
    .publicEncrypt(
      {
        key: public_key,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // Ensure correct padding
      },
      aesKeyBuffer
    )
    .toString("base64");
};

// encrytp AES key for all users in group
export const encryptAESKeyForGroup = async (groupMembers) => {
  // generating aeskey
  const aesKeyBuffer = await generateAESkey();
  return groupMembers.map((member) => ({
    user_id: member.member_id, // Store user ID
    encryptedAESKey: encryptAESKeyWithPublicKey(aesKeyBuffer, member.publicKey), // Encrypt AES Key
  }));
};
