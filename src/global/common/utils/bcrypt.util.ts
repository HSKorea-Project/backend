import * as bcrypt from 'bcrypt';

// 입력받은 평문에 bcrypt 알고리즘을 적용(비밀번호 암호화)
export const hash = async (plainText: string): Promise<string> => {
  const saltOrRounds = 10;
  return await bcrypt.hash(plainText, saltOrRounds);
};

// 저장되어 있는 hashPassword 와 입력받은 password 를 비교합니다.
export const isHashValid = async (passwordHash: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(passwordHash, hashedPassword);
};