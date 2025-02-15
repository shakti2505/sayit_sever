// // Node.js program to demonstrate the
// // crypto.publicEncrypt() method

// // Including crypto and fs module
// import crypto from 'crypto';
// import fs from 'fs';

// // Using a function generateKeyFiles
// function generateKeyFiles() {

// 	const keyPair = crypto.generateKeyPairSync('rsa', {
// 		modulusLength: 2048,
// 		publicKeyEncoding: {
// 			type: 'spki',
// 			format: 'pem'
// 		},
// 		privateKeyEncoding: {
// 		type: 'pkcs8',
// 		format: 'pem',
// 		cipher: 'aes-256-cbc',
// 		passphrase: ''
// 		}
// 	});

// 	// Creating public key file
// 	fs.writeFileSync("public_key_cryppto", keyPair.publicKey);
// }

// // Generate keys
// generateKeyFiles();

// // Creating a function to encrypt string
// function encryptString (plaintext, publicKeyFile) {
// 	const publicKey = fs.readFileSync(publicKeyFile, "utf8");

// 	// publicEncrypt() method with its parameters
// 	const encrypted = crypto.publicEncrypt(
// 		publicKey, Buffer.from(plaintext));
// 	return encrypted.toString("base64");
// }

// // Defining a text to be encrypted
// const plainText = "GfG";

// // Defining encrypted text
// const encrypted = encryptString(plainText, "./public_key_cryppto");

// // Prints plain text
// console.log("Plaintext:", plainText);

// // Prints encrypted text
// console.log("Encrypted: ", encrypted);
const baseKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk/CHgBwnPk7zKKLl+b+UmlL+OZmB6ONdSNxqpLjQbACKR24R3QZaKfo96FY8ZYfzEd6wvC0qzR/E/KCY0sTXKpOKL6b6N8K4JcCDlzHQd3CzPB11DdlwBX4JPBofHOVDaMFjfRoNGGO+UxSToRvwKHYUaBk6UpdI1gQmNEtL3TsPnhhN7Y9IMyv+mwqYvjA+yQC6CaULpiSclnLd4Q0e7cKUFfMGh1Lk8JYJOPmlb0d9sgSSYhBt3mnFAhVTx8Cc8Nvg4CplmM3MDk9mT6aN6z0dap+l8usa6+w1VfgcbPWC8alIvkBLDfmZhBUvY0fZS2tkBU7qjJrgZl51Xwa+pQIDAQAB"

const formattedKey = baseKey.match(/.{1,64}/g)?.join("\n") || base64Key;
console.log(formattedKey)