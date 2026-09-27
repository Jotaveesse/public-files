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
        <Form.Group className="d-flex flex-column">
            <Form.Label htmlFor={id} className="fw-bold text-white">
                {title}
            </Form.Label>
            <Form.Group className="d-flex">
                <Form.Control
                    className="flex-grow-1 bg-secondary border-0 text-white fs-7 fw-bold"
                    value={value}
                    type={showingPassword ? "text" : "password"}
                    id={id}
                    onChange={onChange}
                />
                <IconButton
                    icon={showingPassword ? ImageEyeOpen : ImageEyeClosed}
                    size="sm"
                    outerPadding={false}
                    onClick={handleShowPasswordClick}
                ></IconButton>
            </Form.Group>
        </Form.Group>
    );
};

export default PasswordInput;
