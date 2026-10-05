import Form from "react-bootstrap/Form";
import IconButton from "./IconButton";
import ImageEyeOpen from "../assets/eye-open.svg";
import ImageEyeClosed from "../assets/eye-closed.svg";
import { useState } from "react";

interface PasswordInputProps {
    title?: string;
    value: string;
    horizontalLayout?: boolean;
    variant?: "primary" | "secondary";
    className?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const PasswordInput = ({
    value,
    title,
    horizontalLayout = false,
    variant = "primary",
    className,
    onChange,
}: PasswordInputProps) => {
    const horizontalClassName =
        "d-flex flex-row align-items-center column-gap-2";
    const verticalClassName = "d-flex flex-column";
    const wrapperVariant =
        variant === "primary" ? "bg-primary" : "bg-secondary";

    const [showingPassword, setShowingPassword] = useState(false);

    const handleShowPasswordClick = function () {
        setShowingPassword(!showingPassword);
    };

    return (
        <Form.Group
            className={
                (horizontalLayout ? horizontalClassName : verticalClassName) +
                " " +
                className
            }
        >
            <Form.Label
                className={`fw-bold text-white ${horizontalLayout && "mb-0"}`}
            >
                {title}
            </Form.Label>

            <Form.Group className="d-flex flex-grow-1 column-gap-2">
                <Form.Control
                    className={`flex-grow-1 border-0 text-white py-1 px-2 fs-6 fw-medium ${wrapperVariant}`}
                    value={value}
                    type={showingPassword ? "text" : "password"}
                    autoComplete="off"
                    onChange={onChange}
                />

                <IconButton
                    title={showingPassword ? "Hide Password" : "Show Password"}
                    icon={showingPassword ? ImageEyeOpen : ImageEyeClosed}
                    outerPadding={false}
                    onClick={handleShowPasswordClick}
                ></IconButton>
            </Form.Group>
        </Form.Group>
    );
};

export default PasswordInput;
