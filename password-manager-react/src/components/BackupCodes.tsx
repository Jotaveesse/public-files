import IconButton from "./IconButton.tsx";
import ImagePlus from "../assets/plus.svg";
import { useData, type Credentials } from "../DataContext.tsx";
import Overlay from "react-bootstrap/esm/Overlay";
import Popover from "react-bootstrap/esm/Popover";
import BackupCodesRow from "./BackupCodeRow.tsx";

interface BackupCodesProp extends React.HTMLAttributes<HTMLElement> {
    credentials: Credentials | null;
    target: HTMLElement | null;
    onClose?: () => void;
}

const BackupCodes = ({
    credentials,
    target,
    className,
    onClose,
    ...rest
}: BackupCodesProp) => {
    const { createBackupCode } = useData();

    return (
        <Overlay
            target={target}
            show={!!credentials && !!target}
            placement="left"
            rootClose
            rootCloseEvent="mousedown"
            onHide={onClose}
            {...rest}
        >
            <Popover
                className={`bg-primary p-2 rounded-2 ${className}`}
                style={
                    {
                        maxWidth: "fit-content",
                        "--bs-popover-bg": "var(--bs-secondary)",
                        "--bs-popover-border-color": "var(--bs-secondary)",
                        "--bs-popover-border-width": "0px",
                        ...rest.style,
                    } as React.CSSProperties & {
                        "--bs-popover-bg": string;
                        "--bs-popover-border-color": string;
                        "--bs-popover-border-width": string;
                    }
                }
            >
                <Popover.Body className="bg-secondary d-flex flex-column row-gap-2 p-2">
                    <div className="codes-window">
                        <div className="text-white fs-6 fw-bold">
                            Backup Codes
                        </div>

                        <div className="d-flex flex-column row-gap-2">
                            {credentials?.backupCodes.map((backupCode) => (
                                <BackupCodesRow
                                    key={backupCode.id}
                                    backupCode={backupCode}
                                />
                            ))}
                        </div>
                    </div>

                    <IconButton
                        icon={ImagePlus}
                        title="Add New Backup Code"
                        outerPadding={false}
                        variant="secondary"
                        onClick={() => createBackupCode(credentials!)}
                    ></IconButton>
                </Popover.Body>
            </Popover>
        </Overlay>
    );
};

export default BackupCodes;
