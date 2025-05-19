export const validatePasswords = (password: string, confirmPassword: string) => {
    if (password === confirmPassword && password !== "" && confirmPassword !== "") {
        return true;
    } else {
        return false;
    }
}

export const passwordLength = (password: string) => {
    return password.length < 6;
}