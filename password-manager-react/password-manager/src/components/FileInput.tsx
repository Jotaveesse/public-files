import { useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

interface FileInputProps extends React.TextareaHTMLAttributes<HTMLInputElement> {
    className?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileInput = ({ className, onChange, ...rest }: FileInputProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState("No file selected.");

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const name = files[0].name;

            setFileName(name);

            if (onChange) onChange(e);
        }
    };

    return (
        <Form.Group
            className={`d-flex p-2 bg-secondary rounded-2 column-gap-2 ${className}`}
            {...rest}
        >
            <Form.Control
                className="bg-secondary text-white fw-bold border-0"
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
            <Button variant="primary" onClick={handleButtonClick}>
                Browse...
            </Button>
            <Form.Text className="flex-grow-1 d-flex align-items-center bg-secondary fw-bold text-white">
                {fileName}
            </Form.Text>
        </Form.Group>
    );
};

export default FileInput;
