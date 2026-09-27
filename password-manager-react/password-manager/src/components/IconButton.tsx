import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";

interface IconButtonProps {
    icon: string;
    title?: string;
    variant?: string;
    size?: "sm" | "lg";
    alt?: string;
    style?: React.CSSProperties;
    outerPadding?: boolean;
    onClick?: () => void;
}

const IconButton = ({
    icon,
    title,
    variant = "primary",
    size = "sm",
    alt,
    style,
    outerPadding = true,
    onClick,
}: IconButtonProps) => {
    const wrapperVariant =
        variant === "primary" ? "bg-primary" : "bg-secondary";
    return (
        <div
            className={`${wrapperVariant} ${outerPadding ? "p-1" : "p-0"} rounded-3`}
            style={{ width: "min-content", height: "min-content" }}
        >
            <Button
                title={title}
                variant={variant}
                size={size}
                aria-label={alt}
                onClick={onClick}
                style={{ height: "2rem", ...style }}
                className="d-flex align-items-center justify-content-center p-1 rounded-3"
            >
                <Image
                    src={icon}
                    alt=""
                    style={{
                        height: "100%",
                        objectFit: "contain",
                    }}
                />
            </Button>
        </div>
    );
};

export default IconButton;
