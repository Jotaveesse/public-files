import Form from "react-bootstrap/Form";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    title?: string;
    id?: string;
    className?: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea = ({
    value,
    title,
    id,
    className,
    onChange,
    ...rest
}: TextAreaProps) => {
    return (
        <Form.Group
            controlId="formFileInput"
            className={`flex-grow-1 d-flex flex-column ${className}`}
        >
            <Form.Label htmlFor={id} className="text-white fw-bold">
                {title}
            </Form.Label>
            <Form.Control
                className="flex-grow-1 bg-secondary border-0 rounded-3 text-white fs-7 lh-sm fw-bold"
                style={{ resize: "none" }}
                value={value}
                type="text"
                as="textarea"
                id={id}
                onChange={onChange}
                {...rest}
            />
        </Form.Group>
    );
};

export default TextArea;
