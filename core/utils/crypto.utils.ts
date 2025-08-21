import * as Crypto from 'expo-crypto';

export const generateHash = async (obj: any): Promise<string> => {
  const jsonString = JSON.stringify(obj);
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    jsonString,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
};
