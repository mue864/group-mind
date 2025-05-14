type validateEmailProps = {
    email: string;
}
export const validateEmail = ({email}: validateEmailProps) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}