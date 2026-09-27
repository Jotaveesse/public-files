import { useState } from "react";
import { Button } from "react-bootstrap";
import IconButton from "./components/IconButton";
import imagePlus from "./assets/plus.svg";
import PasswordInput from "./components/PasswordInput";
import FileInput from "./components/FileInput";
import TextArea from "./components/TextArea";

function App() {
    const [textInput, setTextInput] = useState("");
    const [textOutput, setTextOutput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");

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

    return (
        <>
            <div id="main" className="bg-primary d-flex p-2 vh-100 vw-100">
                <div
                    id="crypt-area"
                    className="d-flex flex-column"
                    style={{ width: "40%" }}
                >
                    <div className="flex-grow-1 d-flex flex-column">
                        <TextArea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            title="Input text"
                        ></TextArea>

                        <FileInput
                            className="ms-auto w-75"
                            onChange={handleFileUpload}
                        />

                        <PasswordInput
                            title="Password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                        ></PasswordInput>
                    </div>

                    <div className="flex-grow-1 d-flex flex-column">
                        <TextArea
                            value={textOutput}
                            onChange={(e) => setTextOutput(e.target.value)}
                            title="Output text"
                        ></TextArea>

                        <div className="d-flex">
                            <Button variant="secondary">Decrypt</Button>
                            <Button variant="secondary">Encrypt</Button>
                            <Button variant="secondary">Download</Button>
                        </div>

                        <div className="d-flex flex-column">
                            <div id="progress-bar" className="progress-bar">
                                <div id="bar" className="bar"></div>
                            </div>

                            <div id="error-message">Error</div>
                        </div>
                    </div>
                </div>

                <div id="json-area" className="flex-grow-1">
                    <div id="json-section"></div>

                    <IconButton
                        title="Add New Person"
                        icon={imagePlus}
                        variant="secondary"
                        size="sm"
                    ></IconButton>
                </div>
            </div>

            <template className="codes-popup">
                <div className="codes-window">
                    <div className="codes-title"></div>
                    <div className="code-list">
                        <div className="code-row">
                            <div className="code-input">
                                <input type="password"></input>
                            </div>

                            <div>
                                <div className="button-wrapper">
                                    <div
                                        id="new-code-button"
                                        className="new-button  "
                                        title="Add New Backup Code"
                                    >
                                        <img src="assets/plus.svg" />
                                    </div>
                                </div>

                                <div className="button-wrapper">
                                    <div
                                        id="new-code-button"
                                        className="new-button  "
                                        title="Add New Backup Code"
                                    >
                                        <img src="assets/plus.svg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="button-wrapper">
                    <div
                        id="new-code-button"
                        className="new-button  "
                        title="Add New Backup Code"
                    >
                        <img src="assets/plus.svg" />
                    </div>
                </div>
            </template>

            <template id="person-template">
                <div className="person-row">
                    <div className="person-top">
                        <div className="person-title">Person</div>

                        <div className="person-buttons">
                            <div className="button-wrapper">
                                <button
                                    className="remove-button inverted-button"
                                    title="Remove Person"
                                >
                                    <img src="assets/minus.svg" />
                                </button>
                            </div>

                            <div className="button-wrapper">
                                <button
                                    className="dropdown-button inverted-button"
                                    title="Expand/Collapse"
                                >
                                    <img
                                        className="rotate180"
                                        src="assets/down-arrow.svg"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="person-accounts"></div>
                    <div className="button-wrapper">
                        <div
                            className="new-button inverted-button"
                            title="Add New Account"
                        >
                            <img className="rotate180" src="assets/plus.svg" />
                        </div>
                    </div>
                </div>
            </template>

            <template id="account-template">
                <div className="account-row">
                    <div className="account-top">
                        <div className="account-title">Account</div>
                        <div className="button-wrapper">
                            <button
                                className="remove-button"
                                title="Remove Account"
                            >
                                <img src="assets/minus.svg" />
                            </button>
                        </div>
                    </div>

                    <div className="account-data">
                        <div className="button-wrapper new-account-button">
                            <div className="new-button" title="Add New Login">
                                <img
                                    className="rotate180"
                                    src="assets/plus.svg"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <template id="login-template">
                <div className="data-row">
                    <div className="input-area">
                        <div className="login-field">
                            <span>Login</span>
                            <input></input>
                        </div>

                        <div className="password-field">
                            <span>Password</span>
                            <input type="password"></input>
                            <button
                                className="show-button"
                                title="Show Password"
                            >
                                <img src="assets/eye-open.svg" />
                            </button>
                        </div>
                        <div className="button-wrapper">
                            <button
                                className="copy-button"
                                title="Copy Password"
                            >
                                <img src="assets/copy.svg" />
                            </button>
                        </div>
                        <div className="button-wrapper">
                            <button
                                className="codes-button"
                                title="See Backup Codes"
                            >
                                <img src="assets/safe.svg" />
                            </button>
                        </div>
                    </div>

                    <div className="button-wrapper">
                        <button className="remove-button" title="Remove Login">
                            <img src="assets/minus.svg" />
                        </button>
                    </div>
                </div>
            </template>
        </>
    );
}

export default App;
