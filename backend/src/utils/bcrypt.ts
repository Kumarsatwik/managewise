import bcrypt from 'bcrypt';

export const hashValue = async (value: string,saltRounds:number) => {
  return await bcrypt.hash(value, saltRounds);
};

export const compareValues = async (value: string, hashedValue: string) => {
  return await bcrypt.compare(value, hashedValue);
};