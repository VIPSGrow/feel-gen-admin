export const validatePhone = (phone: string) => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone);
};