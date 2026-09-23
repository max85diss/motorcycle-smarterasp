
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BankAccount {
    AccountNo: string;
    BankName: string;
    Branch: string;
    AccountType: string;
    State: string;
}

interface Branch {
    BranchCode: string;
    BranchName: string;
}

interface BankTransaction {
    GBBNo: string;
    BranchBBNo: string;
    BankTransactionRefNo: string | null;
    RefNo: string | null;
    Date: string;
    AccountNo: string;
    BankName: string;
    Description: string;
    DR: number;
    CR: number;
    State: string;
    BranchCode: string;
    BranchName: string;
    EmpCode: string;
    EmpName: string;
}

interface Balance {
    TotalDR: number;
    TotalCR: number;
    Balance: number;
}

export default function BankBookPage() {

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

    const [bankTransactionRefNo, setBankTransactionRefNo] =
        useState("");

    const [refNo, setRefNo] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [dr, setDr] =
        useState("");

    const [cr, setCr] =
        useState("");

    const [transactions, setTransactions] =
        useState<BankTransaction[]>([]);

    const [accounts, setAccounts] =
        useState<BankAccount[]>([]);

    const [branches, setBranches] =
        useState<Branch[]>([]);

    const [fromDate, setFromDate] =
        useState(today);

    const [toDate, setToDate] =
        useState(today);

    const [filterBranch, setFilterBranch] =
        useState("ALL");

    const [filterAccount, setFilterAccount] =
        useState("ALL");

    const [balance, setBalance] =
        useState<Balance>({
            TotalDR: 0,
            TotalCR: 0,
            Balance: 0
        });

    const [loading, setLoading] =
        useState(false);

    useEffect(() => {
        loadAccounts();
        loadBranches();
        loadData();
    }, []);

    async function loadAccounts() {

        try {

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

        } catch (error) {
            console.error(error);
        }
    }

    async function loadBranches() {

        try {

            const res =
                await fetch(
                    "/api/bankbook/branches"
                );

            const data =
                await res.json();

            setBranches(
                Array.isArray(data.data)
                    ? data.data
                    : []
            );

        } catch (error) {
            console.error(error);
        }
    }

    async function loadData() {

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
                "branchCode",
                filterBranch
            );

            params.set(
                "accountNo",
                filterAccount
            );

            const [
                transactionResponse,
                balanceResponse
            ] = await Promise.all([
                fetch(
                    `/api/bankbook?${params}`
                ),
                fetch(
                    `/api/bankbook/balance?${params}`
                )
            ]);

            const transactionData =
                await transactionResponse.json();

            const balanceData =
                await balanceResponse.json();

            setTransactions(
                Array.isArray(
                    transactionData.data
                )
                    ? transactionData.data
                    : []
            );

            if (
                balanceData.success &&
                balanceData.data
            ) {
                setBalance(
                    balanceData.data
                );
            }

        } catch (error) {

            console.error(error);

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

        if (account) {
            setBankName(
                account.BankName
            );
        } else {
            setBankName("");
        }
    }

    async function saveTransaction(
        e: React.FormEvent
    ) {

        e.preventDefault();

        const DR =
            Number(dr || 0);

        const CR =
            Number(cr || 0);

        if (
            (DR <= 0 && CR <= 0) ||
            (DR > 0 && CR > 0)
        ) {
            alert(
                "Enter either DR or CR."
            );
            return;
        }

        if (!accountNo) {
            alert(
                "Please select bank account."
            );
            return;
        }

        if (!description.trim()) {
            alert(
                "Please enter description."
            );
            return;
        }

        try {

            const res =
                await fetch(
                    "/api/bankbook",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            Date: date,
                            AccountNo:
                                accountNo,
                            BankName:
                                bankName,
                            BankTransactionRefNo:
                                bankTransactionRefNo,
                            RefNo:
                                refNo,
                            Description:
                                description,
                            DR,
                            CR
                        })
                    }
                );

            const data =
                await res.json();

            if (!data.success) {
                alert(
                    data.message ||
                    "Save failed"
                );
                return;
            }

            alert(
                `Saved: ${data.data.GBBNo}`
            );

            setBankTransactionRefNo("");
            setRefNo("");
            setDescription("");
            setDr("");
            setCr("");

            loadData();

        } catch (error) {

            console.error(error);

            alert(
                "Error saving transaction"
            );
        }
    }

    function filterToday() {

        setFromDate(today);
        setToDate(today);

        setTimeout(
            loadData,
            0
        );
    }

    function clearForm() {

        setBankTransactionRefNo("");
        setRefNo("");
        setDescription("");
        setDr("");
        setCr("");
    }

    function formatMoney(
        value: number
    ) {

        return Number(value || 0)
            .toLocaleString(
                "en-LK",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );
    }

    return (
        <div className="p-4 md:p-6">

            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                <div>
                    <h1 className="text-2xl font-bold">
                        Bank Book
                    </h1>

                    <p className="text-sm text-gray-500">
                        Bank transactions and balances
                    </p>
                </div>

              <Link
    href="/manager/bankbook/cheques"
    className="
        inline-flex
        items-center
        justify-center
        rounded
        bg-purple-600
        px-5
        py-2
        text-white
        hover:bg-purple-700
    "
>
    Cheque Details
</Link>

            </div>

            {/* ENTRY */}

            <form
                onSubmit={saveTransaction}
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
                    Bank Transaction
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
                        <label className="mb-1 block text-sm font-medium">
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
                        <label className="mb-1 block text-sm font-medium">
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
                                        }{" "}
                                        -{" "}
                                        {
                                            account.AccountNo
                                        }
                                    </option>
                                )
                            )}

                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Bank Transaction Ref No
                        </label>

                        <input
                            type="text"
                            value={
                                bankTransactionRefNo
                            }
                            onChange={e =>
                                setBankTransactionRefNo(
                                    e.target.value
                                )
                            }
                            placeholder="BTR-000001"
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Ref No
                        </label>

                        <input
                            type="text"
                            value={refNo}
                            onChange={e =>
                                setRefNo(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <label className="mb-1 block text-sm font-medium">
                            Description
                        </label>

                        <input
                            type="text"
                            value={description}
                            onChange={e =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            DR
                        </label>

                        <input
                            type="number"
                            step="0.01"
                            value={dr}
                            onChange={e => {
                                setDr(
                                    e.target.value
                                );

                                if (
                                    e.target.value
                                ) {
                                    setCr("");
                                }
                            }}
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            CR
                        </label>

                        <input
                            type="number"
                            step="0.01"
                            value={cr}
                            onChange={e => {
                                setCr(
                                    e.target.value
                                );

                                if (
                                    e.target.value
                                ) {
                                    setDr("");
                                }
                            }}
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                </div>

                <div className="mt-4 flex flex-wrap gap-3">

                    <button
                        type="submit"
                        className="
                            min-w-[120px]
                            rounded
                            bg-blue-600
                            px-5
                            py-2
                            text-white
                            hover:bg-blue-700
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
                            hover:bg-gray-100
                        "
                    >
                        Clear
                    </button>

                </div>

            </form>

            {/* FILTER */}

            <div
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
                    Filter Bank Transactions
                </h2>

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-4
                        md:grid-cols-2
                        lg:grid-cols-5
                    "
                >

                    <div>
                        <label className="mb-1 block text-sm">
                            From Date
                        </label>

                        <input
                            type="date"
                            value={fromDate}
                            onChange={e =>
                                setFromDate(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">
                            To Date
                        </label>

                        <input
                            type="date"
                            value={toDate}
                            onChange={e =>
                                setToDate(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">
                            Branch
                        </label>

                        <select
                            value={filterBranch}
                            onChange={e =>
                                setFilterBranch(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="ALL">
                                All Branches
                            </option>

                            {branches.map(
                                branch => (
                                    <option
                                        key={
                                            branch.BranchCode
                                        }
                                        value={
                                            branch.BranchCode
                                        }
                                    >
                                        {
                                            branch.BranchName
                                        }
                                    </option>
                                )
                            )}

                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">
                            Bank Account
                        </label>

                        <select
                            value={filterAccount}
                            onChange={e =>
                                setFilterAccount(
                                    e.target.value
                                )
                            }
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="ALL">
                                All Accounts
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
                                        }{" "}
                                        -{" "}
                                        {
                                            account.AccountNo
                                        }
                                    </option>
                                )
                            )}

                        </select>
                    </div>

                    <div className="flex items-end gap-2">

                        <button
                            type="button"
                            onClick={loadData}
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
                            type="button"
                            onClick={filterToday}
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

            {/* BALANCE */}

            <div
                className="
                    mb-6
                    grid
                    grid-cols-1
                    gap-4
                    md:grid-cols-3
                "
            >

                <div className="rounded-lg border bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total DR
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                        Rs. {formatMoney(
                            balance.TotalDR
                        )}
                    </p>
                </div>

                <div className="rounded-lg border bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total CR
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                        Rs. {formatMoney(
                            balance.TotalCR
                        )}
                    </p>
                </div>

                <div className="rounded-lg border bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Bank Balance
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                        Rs. {formatMoney(
                            balance.Balance
                        )}
                    </p>
                </div>

            </div>

            {/* TABLE */}

            <div
                className="
                    overflow-hidden
                    rounded-lg
                    border
                    bg-white
                    shadow-sm
                "
            >

                <div className="overflow-x-auto">

                    <table className="min-w-[1300px] w-full text-sm">

                        <thead className="bg-gray-100">

                            <tr>
                                <th className="px-3 py-3 text-left">
                                    GBB No
                                </th>

                                <th className="px-3 py-3 text-left">
                                    Branch BB No
                                </th>

                                <th className="px-3 py-3 text-left">
                                    Date
                                </th>

                                <th className="px-3 py-3 text-left">
                                    Bank Transaction Ref
                                </th>

                                <th className="px-3 py-3 text-left">
                                    Ref No
                                </th>

                                <th className="px-3 py-3 text-left">
                                    Bank
                                </th>

                                <th className="px-3 py-3 text-left">
                                    Description
                                </th>

                                <th className="px-3 py-3 text-right">
                                    DR
                                </th>

                                <th className="px-3 py-3 text-right">
                                    CR
                                </th>

                                <th className="px-3 py-3 text-left">
                                    Branch
                                </th>

                                <th className="px-3 py-3 text-left">
                                    Employee
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

                            ) : transactions.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan={11}
                                        className="p-6 text-center text-gray-500"
                                    >
                                        No transactions found
                                    </td>
                                </tr>

                            ) : (

                                transactions.map(
                                    item => (

                                        <tr
                                            key={
                                                item.GBBNo
                                            }
                                            className="border-t hover:bg-gray-50"
                                        >

                                            <td className="px-3 py-3 font-medium">
                                                {
                                                    item.GBBNo
                                                }
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    item.BranchBBNo
                                                }
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    item.Date?.substring(
                                                        0,
                                                        10
                                                    )
                                                }
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    item.BankTransactionRefNo ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    item.RefNo ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    item.BankName
                                                }
                                                <br />
                                                <span className="text-xs text-gray-500">
                                                    {
                                                        item.AccountNo
                                                    }
                                                </span>
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    item.Description
                                                }
                                            </td>

                                            <td className="px-3 py-3 text-right">
                                                {item.DR > 0
                                                    ? formatMoney(
                                                        item.DR
                                                    )
                                                    : "-"}
                                            </td>

                                            <td className="px-3 py-3 text-right">
                                                {item.CR > 0
                                                    ? formatMoney(
                                                        item.CR
                                                    )
                                                    : "-"}
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    item.BranchName
                                                }
                                            </td>

                                            <td className="px-3 py-3">
                                                {
                                                    item.EmpName ||
                                                    item.EmpCode
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