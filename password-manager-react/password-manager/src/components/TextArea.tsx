import Form from "react-bootstrap/Form";

interface TextAreaProps {
    title?: string;
    id?: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea = ({ value, title, id, onChange }: TextAreaProps) => {
    return (
        <div>
            <Form.Label htmlFor={id}>{title}</Form.Label>
            <Form.Control
                value={value}
                type="text"
                id={id}
                onChange={onChange}
            />
        </div>
    );
};

export default TextArea;
