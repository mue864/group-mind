export const validatePasswords = (
  password: string,
  confirmPassword: string
) => {
  if (
    password === confirmPassword &&
    password !== "" &&
    confirmPassword !== ""
  ) {
    return true;
  } else {
    return false;
  }
};

// Fix: should return true if password is at least 6 characters
export const passwordLength = (password: string) => {
  return password.length >= 6;
};
