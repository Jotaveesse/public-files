import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: string;
    variant?: "primary" | "secondary";
    style?: React.CSSProperties;
    outerPadding?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const IconButton = ({
    icon,
    variant = "primary",
    className,
    style,
    outerPadding = true,
    onClick,
    ...rest
}: IconButtonProps) => {
    const wrapperVariant =
        variant === "primary" ? "bg-primary" : "bg-secondary";
    return (
        <div
            className={`${wrapperVariant} ${outerPadding ? "p-1" : "p-0"} rounded-3 ${className}`}
            style={{ width: "min-content", height: "min-content" }}
        >
            <Button
                variant={variant}
                onClick={onClick}
                style={{ height: "2.2rem", ...style }}
                className="d-flex align-items-center justify-content-center p-2 rounded-3"
                {...rest}
            >
                <Image
                    src={icon}
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
