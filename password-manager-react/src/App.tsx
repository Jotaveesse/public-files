import { useState } from "react";
import { Button } from "react-bootstrap";
import IconButton from "./components/IconButton";
import ImagePlus from "./assets/plus.svg";
import PasswordInput from "./components/PasswordInput";
import FileInput from "./components/FileInput";
import TextArea from "./components/TextArea";
import PersonRow from "./components/PersonRow";
import { useData, type Credentials, type Data } from "./DataContext";
import { decryptText, encryptText } from "./crypter";
import BackupCodes from "./components/BackupCodes";
import { useIdleTimeout } from "./useIdleTimeout";

function App() {
    const [textInput, setTextInput] = useState("");
    const [textOutput, setTextOutput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [timeLeft, setTimeLeft] = useState("5:00");
    const {
        currentData,
        setCurrentData,
        sortCurrentData,
        createPerson,
        clearData,
    } = useData();
    const [selectedCredentialsId, setSelectedCredentialsId] = useState<
        string | null
    >(null);

    const [popupAnchor, setPopupAnchor] = useState<HTMLElement | null>(null);

    const lock = () => {
        clearData();
        setPasswordInput("");
        setSelectedCredentialsId(null);
    };

    useIdleTimeout(
        lock,
        (timeLeft) => {
            const totalSeconds = Math.max(0, timeLeft / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = Math.floor(totalSeconds % 60);

            const formattedMinutes = String(minutes.toFixed(0)).padStart(
                2,
                "0",
            );
            const formattedSeconds = seconds.toFixed(0).padStart(2, "0");

            setTimeLeft(`${formattedMinutes}:${formattedSeconds}`);
        },
        5 * 60 * 1000,
        currentData.people.length > 0,
    );

    const handleSeeCodes = (credential: Credentials, target: HTMLElement) => {
        setPopupAnchor(target);
        setSelectedCredentialsId(credential.id);
    };

    const handleClosePopup = () => {
        setPopupAnchor(null);
        setSelectedCredentialsId(null);
    };

    const handleFileUpload = function (e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event: ProgressEvent<FileReader>) => {
            const text = event.target?.result;

            if (typeof text === "string") {
                setTextInput(text);
            }
        };

        reader.readAsText(file);
    };

    const handleEncryptButtonClick = async () => {
        try {
            setErrorMessage("");

            const jsonData = JSON.stringify(currentData);
            const encryptedText = await encryptText(jsonData, passwordInput);

            setTextOutput(encryptedText);
        } catch (error) {
            console.error("Encryption error:", error);
            setErrorMessage(
                String(error instanceof Error ? error.message : error) ||
                    "Encryption failed.",
            );
        }
    };

    const handleDecryptButtonClick = async () => {
        try {
            setErrorMessage("");

            const decryptedText = await decryptText(textInput, passwordInput);
            const jsonData: Data = JSON.parse(decryptedText);

            if (
                !jsonData ||
                !jsonData.people ||
                !Array.isArray(jsonData.people)
            ) {
                throw new Error("Decrypt sucessful, but format is invalid.");
            }

            setCurrentData(jsonData);
            sortCurrentData(); //TODO sort the json data itself before updating data
        } catch (error) {
            setErrorMessage(
                String(error instanceof Error ? error.message : error) ||
                    "Decryption failed.",
            );
        }
    };

    const handleDownloadButtonClick = () => {
        const blob = new Blob([textOutput], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "passwords.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div
                id="main"
                className="bg-primary d-flex column-gap-3 p-3 vh-100 vw-100 text-white fw-bold"
            >
                <div
                    id="crypt-area"
                    className="d-flex flex-column row-gap-2"
                    style={{ width: "40%" }}
                >
                    <div className="flex-grow-1 d-flex flex-column row-gap-2">
                        <TextArea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            title="Input text"
                        ></TextArea>

                        <FileInput
                            className="ms-auto w-50"
                            onChange={handleFileUpload}
                        />

                        <PasswordInput
                            title="Password"
                            value={passwordInput}
                            variant="secondary"
                            onChange={(e) => setPasswordInput(e.target.value)}
                        ></PasswordInput>
                    </div>

                    <div className="flex-grow-1 d-flex flex-column row-gap-2">
                        <TextArea
                            value={textOutput}
                            onChange={(e) => setTextOutput(e.target.value)}
                            title="Output text"
                        ></TextArea>

                        <div className="d-flex ms-auto column-gap-2">
                            <Button
                                variant="secondary"
                                onClick={handleDecryptButtonClick}
                            >
                                Decrypt
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleEncryptButtonClick}
                            >
                                Encrypt
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleDownloadButtonClick}
                            >
                                Download
                            </Button>
                        </div>

                        <div className="d-flex w-100">
                            <div
                                className="fw-bold text-align-center ms-auto me-auto fs-6"
                                style={{ height: "1.5em" }}
                            >
                                {errorMessage}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-grow-1 d-flex flex-column row-gap-2 h-100">
                    <div
                        className="fs-6 text-end"
                        style={{
                            visibility:
                                currentData.people.length > 0
                                    ? "visible"
                                    : "hidden",
                        }}
                    >
                        {timeLeft}
                    </div>

                    {currentData.people.length > 0 && (
                        <div className="d-flex flex-column row-gap-2 overflow-y-scroll">
                            {currentData.people.map((person) => (
                                <PersonRow
                                    key={person.id}
                                    person={person}
                                    onSeeCodes={handleSeeCodes}
                                ></PersonRow>
                            ))}
                        </div>
                    )}

                    <IconButton
                        title="Add New Person"
                        icon={ImagePlus}
                        variant="secondary"
                        className="ms-auto"
                        onClick={() => createPerson()}
                    ></IconButton>
                </div>
            </div>

            <BackupCodes
                credentials={
                    currentData.people
                        .flatMap((p) => p.accounts)
                        .flatMap((a) => a.credentials)
                        .find((c) => c.id === selectedCredentialsId) ?? null
                }
                target={popupAnchor}
                onClose={handleClosePopup}
            ></BackupCodes>
        </>
    );
}

export default App;
