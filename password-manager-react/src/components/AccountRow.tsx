import type { Account } from "../DataContext.tsx";
import IconButton from "./IconButton.tsx";
import ImagePlus from "../assets/plus.svg";
import ImageMinus from "../assets/minus.svg";
import React, { useEffect, useRef, useState } from "react";
import { useData } from "../DataContext.tsx";
import { Form } from "react-bootstrap";
import CredentialsRow from "./CredentialsRow.tsx";

interface AccountRowProps extends React.HTMLAttributes<HTMLElement> {
    account: Account;
}

const AccountRow = ({
    account,
    className,
    style,
    ...rest
}: AccountRowProps) => {
    const { updateAccountName, removeAccount, createCredentials } = useData();
    const [editingName, setEditingName] = useState(false);
    const accountNameInput = useRef<HTMLInputElement>(null);
    const accountNameText = useRef<HTMLDivElement>(null);

    const handleAccountDoubleClick = function () {
        setEditingName(true);
    };

    useEffect(() => {
        if (editingName) {
            accountNameInput.current?.focus();
            accountNameText.current?.blur();
        }
    }, [editingName]);

    const handleAccountBlur = function () {
        setEditingName(false);
    };

    return (
        <div {...rest}>
            <div className="d-flex w-50 bg-primary rounded-top-3">
                <Form.Control
                    type="text"
                    ref={accountNameInput}
                    value={account.name}
                    className="bg-secondary p-1 ms-1 border-0 rounded-2 h-50 m-auto text-white fw-bold"
                    style={{ display: editingName ? "block" : "none" }}
                    onBlur={handleAccountBlur}
                    onChange={(e) => updateAccountName(account, e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleAccountBlur();
                        }
                    }}
                ></Form.Control>

                <div
                    className="flex-grow-1 mt-auto mb-auto ms-2"
                    ref={accountNameText}
                    style={{ display: editingName ? "none" : "block" }}
                    onDoubleClick={handleAccountDoubleClick}
                >
                    {account.name}
                </div>

                <IconButton
                    title="Remove Account"
                    icon={ImageMinus}
                    onClick={() => removeAccount(account)}
                ></IconButton>
            </div>

            <div className="">
                {account.credentials.map((credential, index, array) => {
                    const isFirst = index === 0;
                    const isLast = index === array.length - 1;

                    let dynamicRadius = "0";

                    if (isFirst && isLast) {
                        dynamicRadius = "0 0.5rem 0 0.5rem";
                    } else if (isFirst) {
                        dynamicRadius = "0 0.5rem 0 0";
                    } else if (isLast) {
                        dynamicRadius = "0 0 0rem 0.5rem";
                    }

                    return (
                        <CredentialsRow
                            key={credential.id}
                            credentials={credential}
                            style={{ borderRadius: dynamicRadius }}
                        />
                    );
                })}
            </div>
            <IconButton
                className="rounded-top-0 ms-auto"
                title="Add New Credentials"
                icon={ImagePlus}
                onClick={() => createCredentials(account)}
            ></IconButton>
        </div>
    );
};

export default AccountRow;
