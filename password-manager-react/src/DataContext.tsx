import React, { createContext, useContext, useState } from "react";
import { FORMAT_VERSION } from "./crypter";

export type Credentials = {
    id: string;
    username: string;
    password: string;
    backupCodes: BackupCode[];
};

export type BackupCode = {
    id: string;
    code: string;
};

export type Account = { id: string; name: string; credentials: Credentials[] };
export type Person = { id: string; name: string; accounts: Account[] };
export type Data = { version: number; people: Person[] };

const emptyData: Data = {
    people: [],
    version: FORMAT_VERSION,
};

type EditableCredentialField = Exclude<keyof Credentials, "id">;

// 2. Define the Context structure
interface DataContextType {
    currentData: Data;
    setCurrentData: React.Dispatch<React.SetStateAction<Data>>;
    sortCurrentData: () => void;
    clearData: () => void;
    removePerson: (person: Person) => void;
    removeAccount: (account: Account) => void;
    removeCredentials: (credential: Credentials) => void;
    removeBackupCode: (backupCode: BackupCode) => void;
    createPerson: () => void;
    createAccount: (person: Person) => void;
    createCredentials: (account: Account) => void;
    createBackupCode: (credential: Credentials) => void;
    updatePersonName: (person: Person, newName: string) => void;
    updateAccountName: (account: Account, newName: string) => void;
    updateCredential: <K extends EditableCredentialField>(
        credential: Credentials,
        field: K,
        value: Credentials[K],
    ) => void;
    updateBackupCode: (backupCode: BackupCode, newCode: string) => void;
}

// ==========================================
// HELPERS (pure, outside the component)
// ==========================================

const generateId = (): string => crypto.randomUUID();

const makeCredential = (): Credentials => ({
    id: generateId(),
    username: "",
    password: "",
    backupCodes: [],
});

const makeAccount = (): Account => ({
    id: generateId(),
    name: "New Account",
    credentials: [makeCredential()],
});

const makePerson = (): Person => ({
    id: generateId(),
    name: "New Person",
    accounts: [makeAccount()],
});

/**
 * Applies `fn` to every account. Only the people whose accounts actually
 * changed get a new object, so untouched people keep the same reference.
 */
const mapAccounts = (data: Data, fn: (account: Account) => Account): Data => ({
    ...data,
    people: data.people.map((person) => {
        const accounts = person.accounts.map(fn);
        const changed = accounts.some((a, i) => a !== person.accounts[i]);
        return changed ? { ...person, accounts } : person;
    }),
});

const cmp = (a: string, b: string) =>
    a.localeCompare(b, undefined, { sensitivity: "base" });

/** Returns a sorted copy at all three levels. Never mutates its input. */
export const sortData = (data: Data): Data => ({
    ...data,
    people: [...data.people]
        .sort((a, b) => cmp(a.name, b.name))
        .map((person) => ({
            ...person,
            accounts: [...person.accounts]
                .sort((a, b) => cmp(a.name, b.name))
                .map((account) => ({
                    ...account,
                    credentials: [...account.credentials]
                        .sort((a, b) => cmp(a.username, b.username))
                        .map((credential) => ({
                            ...credential,
                            backupCodes: [...credential.backupCodes].sort(
                                (a, b) => cmp(a.code, b.code),
                            ),
                        })),
                })),
        })),
});

// 3. Create the Context
const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentData, setCurrentData] = useState<Data>(emptyData);

    const sortCurrentData = () => setCurrentData((prev) => sortData(prev));

    const clearData = () => setCurrentData(emptyData);

    // ==========================================
    // CREATE METHODS (each is one atomic update)
    // ==========================================

    const createPerson = () => {
        const newPerson = makePerson();
        setCurrentData((prev) => ({
            ...prev,
            people: [...prev.people, newPerson],
        }));
    };

    const createAccount = (person: Person) => {
        const newAccount = makeAccount();
        setCurrentData((prev) => ({
            ...prev,
            people: prev.people.map((p) =>
                p.id === person.id
                    ? { ...p, accounts: [...p.accounts, newAccount] }
                    : p,
            ),
        }));
    };

    const createCredentials = (account: Account) => {
        const newCredential = makeCredential();
        setCurrentData((prev) =>
            mapAccounts(prev, (acc) =>
                acc.id === account.id
                    ? {
                          ...acc,
                          credentials: [...acc.credentials, newCredential],
                      }
                    : acc,
            ),
        );
    };

    const createBackupCode = (credential: Credentials) => {
        const newBackupCode: BackupCode = {
            id: generateId(),
            code: "",
        };

        setCurrentData((prev) =>
            mapAccounts(prev, (acc) =>
                acc.credentials.some((c) => c.id === credential.id)
                    ? {
                          ...acc,
                          credentials: acc.credentials.map((c) =>
                              c.id === credential.id
                                  ? {
                                        ...c,
                                        backupCodes: [
                                            ...c.backupCodes,
                                            newBackupCode,
                                        ],
                                    }
                                  : c,
                          ),
                      }
                    : acc,
            ),
        );
    };

    // ==========================================
    // REMOVE METHODS
    // ==========================================

    const removePerson = (person: Person) => {
        setCurrentData((prev) => ({
            ...prev,
            people: prev.people.filter((p) => p.id !== person.id),
        }));
    };

    const removeAccount = (account: Account) => {
        setCurrentData((prev) => ({
            ...prev,
            people: prev.people.map((p) =>
                p.accounts.some((a) => a.id === account.id)
                    ? {
                          ...p,
                          accounts: p.accounts.filter(
                              (a) => a.id !== account.id,
                          ),
                      }
                    : p,
            ),
        }));
    };

    const removeCredentials = (credential: Credentials) => {
        setCurrentData((prev) =>
            mapAccounts(prev, (acc) =>
                acc.credentials.some((c) => c.id === credential.id)
                    ? {
                          ...acc,
                          credentials: acc.credentials.filter(
                              (c) => c.id !== credential.id,
                          ),
                      }
                    : acc,
            ),
        );
    };

    const removeBackupCode = (backupCode: BackupCode) => {
        const hasCode = (c: Credentials) =>
            c.backupCodes.some((b) => b.id === backupCode.id);

        setCurrentData((prev) =>
            mapAccounts(prev, (acc) =>
                acc.credentials.some(hasCode)
                    ? {
                          ...acc,
                          credentials: acc.credentials.map((c) =>
                              hasCode(c)
                                  ? {
                                        ...c,
                                        backupCodes: c.backupCodes.filter(
                                            (b) => b.id !== backupCode.id,
                                        ),
                                    }
                                  : c,
                          ),
                      }
                    : acc,
            ),
        );
    };

    // ==========================================
    // UPDATE METHODS
    // ==========================================

    const updatePersonName = (person: Person, newName: string) => {
        setCurrentData((prev) => ({
            ...prev,
            people: prev.people.map((p) =>
                p.id === person.id ? { ...p, name: newName } : p,
            ),
        }));
    };

    const updateAccountName = (account: Account, newName: string) => {
        setCurrentData((prev) =>
            mapAccounts(prev, (acc) =>
                acc.id === account.id ? { ...acc, name: newName } : acc,
            ),
        );
    };

    const updateCredential = <K extends EditableCredentialField>(
        credential: Credentials,
        field: K,
        value: Credentials[K],
    ) => {
        setCurrentData((prev) =>
            mapAccounts(prev, (acc) =>
                acc.credentials.some((c) => c.id === credential.id)
                    ? {
                          ...acc,
                          credentials: acc.credentials.map((c) =>
                              c.id === credential.id
                                  ? { ...c, [field]: value }
                                  : c,
                          ),
                      }
                    : acc,
            ),
        );
    };

    const updateBackupCode = (backupCode: BackupCode, newCode: string) => {
        const hasCode = (c: Credentials) =>
            c.backupCodes.some((b) => b.id === backupCode.id);

        setCurrentData((prev) =>
            mapAccounts(prev, (acc) =>
                acc.credentials.some(hasCode)
                    ? {
                          ...acc,
                          credentials: acc.credentials.map((c) =>
                              hasCode(c)
                                  ? {
                                        ...c,
                                        backupCodes: c.backupCodes.map((b) =>
                                            b.id === backupCode.id
                                                ? { ...b, code: newCode }
                                                : b,
                                        ),
                                    }
                                  : c,
                          ),
                      }
                    : acc,
            ),
        );
    };

    return (
        <DataContext.Provider
            value={{
                currentData,
                setCurrentData,
                sortCurrentData,
                clearData,
                createPerson,
                createAccount,
                createCredentials,
                createBackupCode,
                removePerson,
                removeAccount,
                removeCredentials,
                removeBackupCode,
                updatePersonName,
                updateAccountName,
                updateCredential,
                updateBackupCode,
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
