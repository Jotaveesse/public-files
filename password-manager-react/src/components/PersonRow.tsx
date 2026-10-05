import type { Credentials, Person } from "../DataContext.tsx";
import IconButton from "./IconButton.tsx";
import ImagePlus from "../assets/plus.svg";
import ImageMinus from "../assets/minus.svg";
import DownArrow from "../assets/down-arrow.svg";
import UpArrow from "../assets/up-arrow.svg";
import React, { useState, useRef, useEffect } from "react";
import AccountRow from "./AccountRow.tsx";
import { Form } from "react-bootstrap";
import { useData } from "../DataContext";

interface PersonRowProps extends React.HTMLAttributes<HTMLElement> {
    person: Person;
    onSeeCodes?: (credential: Credentials, target: HTMLElement) => void;
}

const PersonRow = ({
    person,
    onSeeCodes,
    className,
    style,
    ...rest
}: PersonRowProps) => {
    const [expanded, setExpanded] = useState("New Person" === person.name);
    const [editingName, setEditingName] = useState(false);
    const personNameInput = useRef<HTMLInputElement>(null);
    const personNameText = useRef<HTMLDivElement>(null);

    const { updatePersonName, removePerson, createAccount } = useData();

    const handleExpandClick = function () {
        setExpanded(!expanded);
    };

    const handlePersonDoubleClick = function () {
        setEditingName(true);
    };

    useEffect(() => {
        if (editingName) {
            personNameInput.current?.focus();
            personNameText.current?.blur();
        }
    }, [editingName]);

    const handlePersonBlur = function () {
        setEditingName(false);
    };

    return (
        <div
            className="w-100 d-flex flex-column row-gap-1 bg-secondary p-2 rounded-3"
            {...rest}
        >
            <div className="d-flex">
                <Form.Control
                    type="text"
                    ref={personNameInput}
                    value={person.name}
                    className="bg-primary fs-5 p-1 border-0 rounded-3 h-75 m-auto text-white fw-bold"
                    style={{ display: editingName ? "block" : "none" }}
                    onBlur={handlePersonBlur}
                    onChange={(e) => updatePersonName(person, e.target.value)}
                ></Form.Control>

                <div
                    ref={personNameText}
                    className="flex-grow-1 fs-5 mt-auto mb-auto ms-1"
                    style={{ display: editingName ? "none" : "block" }}
                    onDoubleClick={handlePersonDoubleClick}
                >
                    {person.name}
                </div>

                <div className="d-flex">
                    <IconButton
                        icon={ImageMinus}
                        title="Remove Person"
                        variant="secondary"
                        onClick={() => removePerson(person)}
                    ></IconButton>

                    <IconButton
                        icon={expanded ? UpArrow : DownArrow}
                        title="Expand/Collapse"
                        variant="secondary"
                        onClick={handleExpandClick}
                    ></IconButton>
                </div>
            </div>

            {expanded && (
                <>
                    <div className="person-accounts">
                        {person.accounts.map((account) => (
                            <AccountRow
                                key={account.id}
                                account={account}
                                onSeeCodes={onSeeCodes}
                            ></AccountRow>
                        ))}
                    </div>

                    <IconButton
                        icon={ImagePlus}
                        title="Add New Account"
                        variant="secondary"
                        outerPadding={false}
                        onClick={() => createAccount(person)}
                    ></IconButton>
                </>
            )}
        </div>
    );
};

export default PersonRow;
