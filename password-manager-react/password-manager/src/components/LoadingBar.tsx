interface LoadingBarProps extends React.TextareaHTMLAttributes<HTMLElement> {
    value: number;
}

const LoadingBar = ({ value, className, style, ...rest }: LoadingBarProps) => {
    const showBar = value !== 0 && value !== 100;
    return (
        <div
            className={`progress bg-secondary w-100 ${className}`}
            role="progressbar"
            aria-label="Success example"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{
                visibility: showBar ? "visible" : "hidden",
                containerType: "size",
                ...style,
            }}
            {...rest}
        >
            <div
                className="progress-bar bg-primary fw-bold"
                style={{
                    width: `${value}%`,
                    fontSize: "60cqh",
                }}
            >
                {value}%
            </div>
        </div>
    );
};

export default LoadingBar;
