import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";

interface IconButtonProps {
    icon: string;
    title?: string;
    variant?: string;
    size?: "sm" | "lg";
    alt?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

const IconButton = ({
    icon,
    title,
    variant = "primary",
    size = "sm",
    alt,
    style,
    onClick,
}: IconButtonProps) => {
    const wrapperVariant =
        variant === "primary" ? "bg-primary" : "bg-secondary";
    return (
        <div
            className={wrapperVariant + " p-1 rounded-3"}
            style={{ width: "min-content", height: "min-content" }}
        >
            <Button
                title={title}
                variant={variant}
                size={size}
                aria-label={alt}
                onClick={onClick}
                style={style}
                className="d-flex align-items-center justify-content-center p-2 rounded-3"
            >
                <Image
                    src={icon}
                    alt=""
                    style={{
                        width: "1.5em",
                        height: "1.5em",
                        objectFit: "contain",
                    }}
                />
            </Button>
        </div>
    );
};

export default IconButton;
