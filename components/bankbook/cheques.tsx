"use client";

import { useEffect, useState } from "react";

interface BankAccount {
    AccountNo: string;
    BankName: string;
    Branch: string;
    AccountType: string;
}

interface Cheque {
    GChequeNo: string;
    GBBNo: string;
    BankTransactionRefNo: string | null;
    AccountNo: string;
    BankName: string;
    ChequeNo: string;
    ChequeDate: string;
    Date: string;
    Payee: string | null;
    Payer: string | null;
    Amount: number;
    ChequeType: string;
    Description: string | null;
    State: string;
    BranchName: string;
}

export default function BankChequesPage() {

    const today =
        new Date()
            .toISOString()
            .substring(0, 10);

    const [date, setDate] =
        useState(today);

    const [accountNo, setAccountNo] =
        useState("");

    const [bankName, setBankName] =
        useState("");

    const [gbbNo, setGbbNo] =
        useState("");

    const [bankTransactionRefNo, setBankTransactionRefNo] =
        useState("");

    const [chequeNo, setChequeNo] =
        useState("");

    const [chequeDate, setChequeDate] =
        useState(today);

    const [payee, setPayee] =
        useState("");

    const [payer, setPayer] =
        useState("");

    const [amount, setAmount] =
        useState("");

    const [chequeType, setChequeType] =
        useState("Received");

    const [description, setDescription] =
        useState("");

    const [state, setState] =
        useState("Pending");

    const [accounts, setAccounts] =
        useState<BankAccount[]>([]);

    const [cheques, setCheques] =
        useState<Cheque[]>([]);

    const [fromDate, setFromDate] =
        useState(today);

    const [toDate, setToDate] =
        useState(today);

    const [filterState, setFilterState] =
        useState("ALL");

    const [loading, setLoading] =
        useState(false);

    useEffect(() => {

        loadAccounts();
        loadCheques();

    }, []);

    async function loadAccounts() {

        const res =
            await fetch(
                "/api/bankbook/accounts"
            );

        const data =
            await res.json();

        setAccounts(
            Array.isArray(data.data)
                ? data.data
                : []
        );
    }

    async function loadCheques() {

        setLoading(true);

        try {

            const params =
                new URLSearchParams();

            params.set(
                "fromDate",
                fromDate
            );

            params.set(
                "toDate",
                toDate
            );

            params.set(
                "state",
                filterState
            );

            const res =
                await fetch(
                    `/api/bank-cheques?${params}`
                );

            const data =
                await res.json();

            setCheques(
                Array.isArray(data.data)
                    ? data.data
                    : []
            );

        } finally {

            setLoading(false);
        }
    }

    function selectAccount(
        value: string
    ) {

        setAccountNo(value);

        const account =
            accounts.find(
                x =>
                    x.AccountNo === value
            );

        setBankName(
            account?.BankName || ""
        );
    }

    async function saveCheque(
        e: React.FormEvent
    ) {

        e.preventDefault();

        if (!gbbNo) {
            alert(
                "Enter the GBB No of the bank transaction."
            );
            return;
        }

        if (!accountNo) {
            alert(
                "Select bank account."
            );
            return;
        }

        if (!chequeNo) {
            alert(
                "Enter cheque number."
            );
            return;
        }

        if (
            Number(amount) <= 0
        ) {
            alert(
                "Enter valid amount."
            );
            return;
        }

        const res =
            await fetch(
                "/api/bank-cheques",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        GBBNo: gbbNo,
                        BankTransactionRefNo:
                            bankTransactionRefNo,
                        AccountNo:
                            accountNo,
                        BankName:
                            bankName,
                        ChequeNo:
                            chequeNo,
                        ChequeDate:
                            chequeDate,
                        Date:
                            date,
                        Payee:
                            payee,
                        Payer:
                            payer,
                        Amount:
                            Number(amount),
                        ChequeType:
                            chequeType,
                        Description:
                            description
                    })
                }
            );

        const data =
            await res.json();

        if (!data.success) {
            alert(
                data.message
            );
            return;
        }

        alert(
            `Cheque saved: ${data.data.GChequeNo}`
        );

        clearForm();
        loadCheques();
    }

    function clearForm() {

        setGbbNo("");
        setBankTransactionRefNo("");
        setChequeNo("");
        setPayee("");
        setPayer("");
        setAmount("");
        setDescription("");
        setState("Pending");
    }

    function todayFilter() {

        setFromDate(today);
        setToDate(today);

        setTimeout(
            loadCheques,
            0
        );
    }

    return (
        <div className="p-4 md:p-6">

            <div className="mb-6 flex items-center justify-between">

                <div>
                    <h1 className="text-2xl font-bold">
                        Cheque Details
                    </h1>

                    <p className="text-sm text-gray-500">
                        Bank cheque management
                    </p>
                </div>

                <a
                    href="/bankbook"
                    className="
                        rounded
                        bg-blue-600
                        px-5
                        py-2
                        text-white
                    "
                >
                    Bankbook
                </a>

            </div>

            <form
                onSubmit={saveCheque}
                className="
                    mb-6
                    rounded-lg
                    border
                    bg-white
                    p-4
                    shadow-sm
                "
            >

                <h2 className="mb-4 text-lg font-semibold">
                    Add Cheque
                </h2>

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-4
                        md:grid-cols-2
                        lg:grid-cols-4
                    "
                >

                    <div>
                        <label className="mb-1 block text-sm">
                            Date
                        </label>

                        <input
                            type="date"
                            value={date}
                            onChange={e =>
                                setDate(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">
                            GBB No
                        </label>

                        <input
                            value={gbbNo}
                            onChange={e =>
                                setGbbNo(
                                    e.target.value
                                )
                            }
                            placeholder="GBB00000001"
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">
                            Bank Transaction Ref
                        </label>

                        <input
                            value={
                                bankTransactionRefNo
                            }
                            onChange={e =>
                                setBankTransactionRefNo(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">
                            Bank Account
                        </label>

                        <select
                            value={accountNo}
                            onChange={e =>
                                selectAccount(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        >

                            <option value="">
                                Select Account
                            </option>

                            {accounts.map(
                                account => (

                                    <option
                                        key={
                                            account.AccountNo
                                        }
                                        value={
                                            account.AccountNo
                                        }
                                    >
                                        {
                                            account.BankName
                                        } - {
                                            account.AccountNo
                                        }
                                    </option>

                                )
                            )}

                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">
                            Cheque No
                        </label>

                        <input
                            value={chequeNo}
                            onChange={e =>
                                setChequeNo(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">
                            Cheque Date
                        </label>

                        <input
                            type="date"
                            value={chequeDate}
                            onChange={e =>
                                setChequeDate(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">
                            Cheque Type
                        </label>

                        <select
                            value={chequeType}
                            onChange={e =>
                                setChequeType(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="Received">
                                Received
                            </option>

                            <option value="Issued">
                                Issued
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">
                            State
                        </label>

                        <select
                            value={state}
                            onChange={e =>
                                setState(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="Pending">
                                Pending
                            </option>

                            <option value="Deposited">
                                Deposited
                            </option>

                            <option value="Cleared">
                                Cleared
                            </option>

                            <option value="Bounced">
                                Bounced
                            </option>

                            <option value="Cancelled">
                                Cancelled
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">
                            Payee
                        </label>

                        <input
                            value={payee}
                            onChange={e =>
                                setPayee(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">
                            Payer
                        </label>

                        <input
                            value={payer}
                            onChange={e =>
                                setPayer(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">
                            Amount
                        </label>

                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={e =>
                                setAmount(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div className="lg:col-span-2">

                        <label className="mb-1 block text-sm">
                            Description
                        </label>

                        <input
                            value={description}
                            onChange={e =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        />

                    </div>

                </div>

                <div className="mt-4 flex gap-3">

                    <button
                        type="submit"
                        className="
                            min-w-[120px]
                            rounded
                            bg-blue-600
                            px-5
                            py-2
                            text-white
                        "
                    >
                        Save
                    </button>

                    <button
                        type="button"
                        onClick={clearForm}
                        className="
                            min-w-[120px]
                            rounded
                            border
                            px-5
                            py-2
                        "
                    >
                        Clear
                    </button>

                </div>

            </form>

            {/* FILTER */}

            <div className="mb-6 rounded-lg border bg-white p-4">

                <div className="
                    grid
                    grid-cols-1
                    gap-4
                    md:grid-cols-4
                ">

                    <input
                        type="date"
                        value={fromDate}
                        onChange={e =>
                            setFromDate(
                                e.target.value
                            )
                        }
                        className="rounded border px-3 py-2"
                    />

                    <input
                        type="date"
                        value={toDate}
                        onChange={e =>
                            setToDate(
                                e.target.value
                            )
                        }
                        className="rounded border px-3 py-2"
                    />

                    <select
                        value={filterState}
                        onChange={e =>
                            setFilterState(
                                e.target.value
                            )
                        }
                        className="rounded border px-3 py-2"
                    >

                        <option value="ALL">
                            All States
                        </option>

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="Deposited">
                            Deposited
                        </option>

                        <option value="Cleared">
                            Cleared
                        </option>

                        <option value="Bounced">
                            Bounced
                        </option>

                        <option value="Cancelled">
                            Cancelled
                        </option>

                    </select>

                    <div className="flex gap-2">

                        <button
                            onClick={loadCheques}
                            className="
                                flex-1
                                rounded
                                bg-blue-600
                                px-4
                                py-2
                                text-white
                            "
                        >
                            Filter
                        </button>

                        <button
                            onClick={todayFilter}
                            className="
                                flex-1
                                rounded
                                bg-gray-700
                                px-4
                                py-2
                                text-white
                            "
                        >
                            Today
                        </button>

                    </div>

                </div>

            </div>

            {/* TABLE */}

            <div className="overflow-hidden rounded-lg border bg-white">

                <div className="overflow-x-auto">

                    <table className="min-w-[1300px] w-full text-sm">

                        <thead className="bg-gray-100">

                            <tr>

                                <th className="px-3 py-3 text-left">
                                    Cheque Ref
                                </th>

                                <th className="px-3 py-3 text-left">
                                    GBB No
                                </th>

                                <th className="px-3 py-3 text-left">
                                    Bank Ref
                                </th>

                                <th className="px-3 py-3 text-left">
                                    Cheque No
                                </th>

                                <th className="px-3 py-3 text-left">
                                    Cheque Date
                                </th>

                                <th className="px-3 py-3 text-left">
                                    Bank
                                </th>

                                <th className="px-3 py-3 text-left">
                                    Payee
                                </th>

                                <th className="px-3 py-3 text-left">
                                    Payer
                                </th>

                                <th className="px-3 py-3 text-right">
                                    Amount
                                </th>

                                <th className="px-3 py-3 text-left">
                                    Type
                                </th>

                                <th className="px-3 py-3 text-left">
                                    State
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>
                                    <td
                                        colSpan={11}
                                        className="p-6 text-center"
                                    >
                                        Loading...
                                    </td>
                                </tr>

                            ) : cheques.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan={11}
                                        className="p-6 text-center"
                                    >
                                        No cheques found
                                    </td>
                                </tr>

                            ) : (

                                cheques.map(
                                    cheque => (

                                        <tr
                                            key={
                                                cheque.GChequeNo
                                            }
                                            className="border-t hover:bg-gray-50"
                                        >

                                            <td className="px-3 py-3 font-medium">
                                                {
                                                    cheque.GChequeNo
                                                }
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    cheque.GBBNo
                                                }
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    cheque.BankTransactionRefNo ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    cheque.ChequeNo
                                                }
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    cheque.ChequeDate?.substring(
                                                        0,
                                                        10
                                                    )
                                                }
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    cheque.BankName
                                                }
                                                <br />
                                                <span className="text-xs text-gray-500">
                                                    {
                                                        cheque.AccountNo
                                                    }
                                                </span>
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    cheque.Payee ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    cheque.Payer ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="px-3 py-3 text-right">
                                                {Number(
                                                    cheque.Amount
                                                ).toLocaleString(
                                                    "en-LK",
                                                    {
                                                        minimumFractionDigits: 2
                                                    }
                                                )}
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    cheque.ChequeType
                                                }
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    cheque.State
                                                }
                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}