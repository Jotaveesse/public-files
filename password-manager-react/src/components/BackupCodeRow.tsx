import IconButton from "./IconButton.tsx";
import ImageCopy from "../assets/copy.svg";
import ImageCheckSquare from "../assets/check-square.svg";
import ImageMinus from "../assets/minus.svg";
import React, { useState } from "react";
import { useData, type BackupCode } from "../DataContext.tsx";
import PasswordInput from "./PasswordInput.tsx";

interface BackupCodesRowProps extends React.HTMLAttributes<HTMLElement> {
    backupCode: BackupCode;
}

const BackupCodesRow = ({
    backupCode,
    className,
    ...rest
}: BackupCodesRowProps) => {
    const { updateBackupCode, removeBackupCode } = useData();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(backupCode.code);

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <div
            className={`d-flex align-items-center column-gap-2 ${className}`}
            {...rest}
        >
            <PasswordInput
                value={backupCode.code}
                style={{ minWidth: "20rem" }}
                onChange={(e) => updateBackupCode(backupCode, e.target.value)}
            ></PasswordInput>

            <div className="d-flex align-items-center column-gap-2">
                <IconButton
                    icon={copied ? ImageCheckSquare : ImageCopy}
                    title={copied ? "Copied!" : "Copy Backup Code"}
                    outerPadding={false}
                    onClick={() => {
                        handleCopy();
                    }}
                ></IconButton>

                <IconButton
                    icon={ImageMinus}
                    title="Remove Backup Code"
                    outerPadding={false}
                    onClick={() => {
                        removeBackupCode(backupCode);
                    }}
                ></IconButton>
            </div>
        </div>
    );
};

export default BackupCodesRow;
