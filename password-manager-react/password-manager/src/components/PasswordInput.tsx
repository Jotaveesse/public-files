import Form from "react-bootstrap/Form";
import IconButton from "./IconButton";
import ImageEyeOpen from "../assets/eye-open.svg";
import ImageEyeClosed from "../assets/eye-closed.svg";
import { useState } from "react";

interface PasswordInputProps {
    title?: string;
    id?: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const PasswordInput = ({ value, title, id, onChange }: PasswordInputProps) => {
    const [showingPassword, setShowingPassword] = useState(false);

    const handleShowPasswordClick = function () {
        setShowingPassword(!showingPassword);
    };
    return (
        <div>
            <Form.Label htmlFor={id}>{title}</Form.Label>
            <Form.Control
                value={value}
                type={showingPassword ? "text" : "password"}
                id={id}
                onChange={onChange}
            />
            <IconButton
                icon={showingPassword ? ImageEyeOpen : ImageEyeClosed}
                onClick={handleShowPasswordClick}
            ></IconButton>
        </div>
    );
};

export default PasswordInput;
