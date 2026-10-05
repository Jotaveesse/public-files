import Form from "react-bootstrap/Form";

interface TextInputProps extends React.HTMLAttributes<HTMLElement> {
    title?: string;
    value: string;
    horizontalLayout?: boolean;
    className?: string;
    variant?: "primary" | "secondary";
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextInput = ({
    value,
    title,
    horizontalLayout = false,
    variant = "primary",
    className,
    onChange,
    ...rest
}: TextInputProps) => {
    const horizontalClassName =
        "d-flex flex-row align-items-center column-gap-2";
    const verticalClassName = "d-flex flex-column";
    const wrapperVariant =
        variant === "primary" ? "bg-primary" : "bg-secondary";

    return (
        <Form.Group
            className={
                (horizontalLayout ? horizontalClassName : verticalClassName) +
                " " +
                className
            }
            {...rest}
        >
            <Form.Label
                className={`fw-bold text-white ${horizontalLayout && "mb-0"}`}
            >
                {title}
            </Form.Label>
            <Form.Group className="flex-grow-1 d-flex column-gap-2">
                <Form.Control
                    className={`flex-grow-1 border-0 text-white py-1 px-2 fs-6 fw-medium ${wrapperVariant}`}
                    value={value}
                    type="text"
                    onChange={onChange}
                />
            </Form.Group>
        </Form.Group>
    );
};

export default TextInput;
