import React, { createContext, useContext, useState } from "react";

// 1. Define your Types
export type Credentials = {
    id: number;
    accountId: number;
    username: string;
    password: string;
    backupCodes: string[];
};

export type Account = {
    id: number;
    personId: number;
    name: string;
    credentialIds: number[];
};

export type Person = {
    id: number;
    name: string;
    accountIds: number[];
};

export type Data = {
    people: Record<number, Person>;
    accounts: Record<number, Account>;
    credentials: Record<number, Credentials>;
};

// 2. Define the Context structure
interface DataContextType {
    currentData: Data;
    setCurrentData: React.Dispatch<React.SetStateAction<Data>>;
    sortCurrentData: () => void;
    removePerson: (personId: number) => void;
    removeAccount: (accountId: number) => void;
    removeCredentials: (credentialId: number) => void;
    createPerson: () => void;
    createAccount: (personId: number) => void;
    createCredentials: (accountId: number) => void;
    updatePersonName: (personId: number, newName: string) => void;
    updateAccountName: (accountId: number, newName: string) => void;
    updateCredential: (
        credentialId: number,
        field: keyof Credentials,
        value: any,
    ) => void;
}

const emptyData: Data = {
    people: {},
    accounts: {},
    credentials: {},
};

// 3. Create the Context
const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentData, setCurrentData] = useState<Data>(emptyData);

    // Simple helper to generate unique numeric IDs
    const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

    const sortCurrentData = () => {
        setCurrentData((prev) => {
            const sortedPeople = Object.values(prev.people).sort((a, b) =>
                a.name.localeCompare(b.name),
            );
            const sortedAccounts = Object.values(prev.accounts).sort((a, b) =>
                a.name.localeCompare(b.name),
            );
            const sortedCredentials = Object.values(prev.credentials).sort(
                (a, b) => a.username.localeCompare(b.username),
            );

            return {
                ...prev,
                people: sortedPeople.reduce(
                    (acc, person) => ({ ...acc, [person.id]: person }),
                    {},
                ),
                accounts: sortedAccounts.reduce(
                    (acc, account) => ({ ...acc, [account.id]: account }),
                    {},
                ),
                credentials: sortedCredentials.reduce(
                    (acc, credential) => ({
                        ...acc,
                        [credential.id]: credential,
                    }),
                    {},
                ),
            };
        });
    };

    // ==========================================
    // CREATE METHODS
    // ==========================================

    const createPerson = () => {
        const newId = generateId();
        setCurrentData((prev) => {
            return {
                ...prev,
                people: {
                    ...prev.people,
                    [newId]: { id: newId, name: "New Person", accountIds: [] },
                },
            };
        });

        createAccount(newId);
    };

    const createAccount = (personId: number) => {
        const newId = generateId();
        setCurrentData((prev) => {
            const newAccount = {
                id: newId,
                personId: personId,
                name: "New Account",
                credentialIds: [],
            };

            return {
                ...prev,
                // Add the new account to the dictionary
                accounts: {
                    ...prev.accounts,
                    [newId]: newAccount,
                },
                // Link the new account ID to the parent person
                people: {
                    ...prev.people,
                    [personId]: {
                        ...prev.people[personId],
                        accountIds: [
                            ...prev.people[personId].accountIds,
                            newId,
                        ],
                    },
                },
            };
        });

        createCredentials(newId);
    };

    const createCredentials = (accountId: number) => {
        setCurrentData((prev) => {
            const newId = generateId();
            const newCredential = {
                id: newId,
                accountId: accountId,
                username: "",
                password: "",
                backupCodes: [],
            };

            return {
                ...prev,
                // Add new credentials to the dictionary
                credentials: {
                    ...prev.credentials,
                    [newId]: newCredential,
                },
                // Link the new credential ID to the parent account
                accounts: {
                    ...prev.accounts,
                    [accountId]: {
                        ...prev.accounts[accountId],
                        credentialIds: [
                            ...prev.accounts[accountId].credentialIds,
                            newId,
                        ],
                    },
                },
            };
        });
    };

    // ==========================================
    // REMOVE METHODS
    // ==========================================

    const removePerson = (personId: number) => {
        setCurrentData((prev) => {
            const { [personId]: _, ...remainingPeople } = prev.people;

            // Note: In a production app, you might also want to loop through this person's
            // accountIds and delete those accounts and credentials to free up memory (Cascading Delete).
            return {
                ...prev,
                people: remainingPeople,
            };
        });
    };

    const removeAccount = (accountId: number) => {
        setCurrentData((prev) => {
            const accountToDelete = prev.accounts[accountId];
            if (!accountToDelete) return prev; // Safety check
            const personId = accountToDelete.personId;

            // 1. Remove the accountId from the Person's array
            const updatedPerson = {
                ...prev.people[accountToDelete.personId],
                accountIds: prev.people[personId].accountIds.filter(
                    (id) => id !== accountId,
                ),
            };

            // 2. Remove the Account from the accounts dictionary
            const { [accountId]: _, ...remainingAccounts } = prev.accounts;

            // 3. Remove all associated Credentials to prevent memory leaks
            const remainingCredentials = { ...prev.credentials };
            accountToDelete.credentialIds.forEach((credId) => {
                delete remainingCredentials[credId];
            });

            return {
                ...prev,
                people: {
                    ...prev.people,
                    [personId]: updatedPerson,
                },
                accounts: remainingAccounts,
                credentials: remainingCredentials, // Fixed from your previous snippet
            };
        });
    };

    const removeCredentials = (credentialId: number) => {
        setCurrentData((prev) => {
            const accountId = prev.credentials[credentialId].accountId;
            // 1. Remove credentialId from the parent Account's array
            const updatedAccount = {
                ...prev.accounts[accountId],
                credentialIds: prev.accounts[accountId].credentialIds.filter(
                    (id) => id !== credentialId,
                ),
            };

            // 2. Remove the credential from the credentials dictionary
            const { [credentialId]: _, ...remainingCredentials } =
                prev.credentials;

            return {
                ...prev,
                accounts: {
                    ...prev.accounts,
                    [accountId]: updatedAccount,
                },
                credentials: remainingCredentials,
            };
        });
    };

    // ==========================================
    // UPDATE METHODS
    // ==========================================

    const updatePersonName = (personId: number, newName: string) => {
        setCurrentData((prev) => ({
            ...prev,
            people: {
                ...prev.people,
                [personId]: { ...prev.people[personId], name: newName },
            },
        }));
    };

    const updateAccountName = (accountId: number, newName: string) => {
        setCurrentData((prev) => ({
            ...prev,
            accounts: {
                ...prev.accounts,
                [accountId]: { ...prev.accounts[accountId], name: newName },
            },
        }));
    };

    const updateCredential = (
        credentialId: number,
        field: keyof Credentials,
        value: any,
    ) => {
        setCurrentData((prev) => ({
            ...prev,
            credentials: {
                ...prev.credentials,
                [credentialId]: {
                    ...prev.credentials[credentialId],
                    [field]: value,
                },
            },
        }));
    };

    return (
        <DataContext.Provider
            value={{
                currentData,
                setCurrentData: setCurrentData,
                sortCurrentData,
                createPerson,
                createAccount,
                createCredentials,
                removePerson,
                removeAccount,
                removeCredentials,
                updatePersonName,
                updateAccountName,
                updateCredential,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

// 5. Create a Custom Hook for easy access
export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};
