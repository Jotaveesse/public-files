import IconButton from "./IconButton.tsx";
import ImageCopy from "../assets/copy.svg";
import ImageCheckSquare from "../assets/check-square.svg";
import ImageSafe from "../assets/safe.svg";
import ImageMinus from "../assets/minus.svg";
import React, { useState } from "react";
import { useData, type Credentials } from "../DataContext.tsx";
import TextInput from "./TextInput.tsx";
import PasswordInput from "./PasswordInput.tsx";

interface CredentialsRowProps extends React.HTMLAttributes<HTMLElement> {
    credentials: Credentials;
    onSeeCodes?: (credential: Credentials, target: HTMLElement) => void;
}

const CredentialsRow = ({
    credentials,
    onSeeCodes,
    className,
    ...rest
}: CredentialsRowProps) => {
    const { updateCredential, removeCredentials } = useData();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(credentials.password);

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <div className="bg-primary pt-1 pb-1 ps-2 pe-0" {...rest}>
            <div className="d-flex">
                <TextInput
                    title="Login"
                    value={credentials.username}
                    horizontalLayout={true}
                    variant="secondary"
                    className="flex-grow-1"
                    onChange={(e) =>
                        updateCredential(
                            credentials,
                            "username",
                            e.target.value,
                        )
                    }
                ></TextInput>

                <PasswordInput
                    title="Password"
                    value={credentials.password}
                    horizontalLayout={true}
                    variant="secondary"
                    className="flex-grow-1 ms-4"
                    onChange={(e) =>
                        updateCredential(
                            credentials,
                            "password",
                            e.target.value,
                        )
                    }
                ></PasswordInput>

                <div className="d-flex">
                    <IconButton
                        title={copied ? "Copied" : "Copy Password"}
                        icon={copied ? ImageCheckSquare : ImageCopy}
                        onClick={handleCopy}
                    ></IconButton>

                    <IconButton
                        title="See Backup Codes"
                        icon={ImageSafe}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            if (onSeeCodes) {
                                onSeeCodes(credentials, e.currentTarget);
                            }
                        }}
                    ></IconButton>

                    <IconButton
                        title="Remove Credentials"
                        icon={ImageMinus}
                        onClick={() => removeCredentials(credentials)}
                    ></IconButton>
                </div>
            </div>
        </div>
    );
};

export default CredentialsRow;
