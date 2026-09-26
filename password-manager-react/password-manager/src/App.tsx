import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import IconButton from "./components/IconButton";
import imagePlus from "./assets/plus.svg";
import PasswordInput from "./components/PasswordInput";

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
                <div id="crypt-area" className="" style={{ width: "40%" }}>
                    <div className="input-section">
                        <Form.Group controlId="formFileInput" className="">
                            <Form.Label htmlFor="textInput">
                                Input text
                            </Form.Label>
                            <Form.Control
                                value={textInput}
                                type="text"
                                id="textInput"
                                onChange={(e) => setTextInput(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="formFileInput" className="">
                            <Form.Control
                                type="file"
                                onChange={handleFileUpload}
                            />
                        </Form.Group>

                        <PasswordInput
                            title="Password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                        ></PasswordInput>
                    </div>

                    <div className="output-section">
                        <Form.Group controlId="formOutput" className="">
                            <Form.Label htmlFor="textOutput">
                                Output text
                            </Form.Label>
                            <Form.Control
                                value={textOutput}
                                type="text"
                                id="textOutput"
                                onChange={(e) => setTextOutput(e.target.value)}
                            />
                        </Form.Group>

                        <div className="button-section">
                            <Button variant="secondary">Decrypt</Button>
                            <Button variant="secondary">Encrypt</Button>
                            <Button variant="secondary">Download</Button>
                        </div>

                        <div className="progress-section">
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
