
"use client";

import {
    useEffect,
    useState,
} from "react";


interface Stock {

    StockID: number;

    GlobalStockNo: string;

    BranchStockID: string;

    ConsignmentNo: string;

    ConsignmentItemNo: string;

    PartNo: string;

    SerialNo: string | null;

    ENO: string | null;

    FNO: string | null;

    Remark: string | null;

    ReportNo: string | null;

    BranchCode: string;

    BranchName: string;

    Status: string;

    CreatedDate: string;
}


interface Branch {

    BranchCode: string;

    BranchName: string;
}


export default function StockPage() {

    const [stock, setStock] =
        useState<Stock[]>([]);


    const [branches, setBranches] =
        useState<Branch[]>([]);


    const [selectedBranch, setSelectedBranch] =
        useState("ALL");


    const [isManager, setIsManager] =
        useState(false);


    const [loading, setLoading] =
        useState(false);


    const [search, setSearch] =
        useState("");


    useEffect(() => {

        initialize();

    }, []);


    async function initialize() {

        await loadStock();

        await loadBranches();

    }


    async function loadBranches() {

        try {

            const response =
                await fetch(
                    "/api/branch/list"
                );


            const data =
                await response.json();


            if (
                response.ok &&
                data.success
            ) {

                setBranches(
                    data.data
                );

                setIsManager(true);

            } else {

                /*
                 * Normal user.
                 *
                 * Do not show branch selector.
                 */

                setIsManager(false);
            }


        } catch (error) {

            console.error(
                "Branch loading error:",
                error
            );

            setIsManager(false);
        }
    }


    async function loadStock(
        branchCode?: string
    ) {

        setLoading(true);


        try {

            let url =
                "/api/stock";


            if (
                branchCode &&
                branchCode !== "ALL"
            ) {

                url +=
                    `?branchCode=${encodeURIComponent(
                        branchCode
                    )}`;
            }


            const response =
                await fetch(url);


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    data.message ||
                    "Unable to load stock."
                );

                return;
            }


            setStock(
                data.data
            );


            /*
             * API tells us whether this
             * is manager/admin.
             */

            setIsManager(
                data.isManager
            );


        } catch (error) {

            console.error(error);

            alert(
                "Unable to load stock."
            );

        } finally {

            setLoading(false);
        }
    }


    function changeBranch(
        value: string
    ) {

        setSelectedBranch(
            value
        );

        loadStock(
            value
        );
    }


    const filteredStock =
        stock.filter(
            item => {

                const text =
                    search
                        .toLowerCase()
                        .trim();


                if (!text) {
                    return true;
                }


                return (

                    item.GlobalStockNo
                        ?.toLowerCase()
                        .includes(text)

                    ||

                    item.BranchStockID
                        ?.toLowerCase()
                        .includes(text)

                    ||

                    item.PartNo
                        ?.toLowerCase()
                        .includes(text)

                    ||

                    item.SerialNo
                        ?.toLowerCase()
                        .includes(text)

                    ||

                    item.ENO
                        ?.toLowerCase()
                        .includes(text)

                    ||

                    item.FNO
                        ?.toLowerCase()
                        .includes(text)

                    ||

                    item.ConsignmentNo
                        ?.toLowerCase()
                        .includes(text)
                );
            }
        );


    return (

        <div className="min-h-screen bg-slate-100 p-4 md:p-6">

            {/* HEADER */}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                    <h1 className="text-2xl font-bold text-slate-800">
                        Stock
                    </h1>

                    <p className="text-sm text-slate-500">
                        Motorcycle Stock
                    </p>

                </div>


                <button
                    onClick={() =>
                        loadStock(
                            selectedBranch
                        )
                    }
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading
                        ? "Loading..."
                        : "Refresh"}
                </button>

            </div>


            {/* FILTER AREA */}

            <div className="mb-6 rounded-xl bg-white p-5 shadow">

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    {/* BRANCH */}

                    {isManager ? (

                        <div>

                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Branch
                            </label>

                            <select
                                value={
                                    selectedBranch
                                }
                                onChange={e =>
                                    changeBranch(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border px-3 py-2"
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
                                            {" ("}
                                            {
                                                branch.BranchCode
                                            }
                                            {")"}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    ) : (

                        <div>

                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Branch
                            </label>

                            <div className="rounded-lg border bg-slate-100 px-3 py-2 text-slate-700">
                                Current Branch
                            </div>

                        </div>

                    )}


                    {/* SEARCH */}

                    <div className="md:col-span-2">

                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Search Stock
                        </label>

                        <input
                            type="text"
                            value={search}
                            onChange={e =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search Global Stock No, Branch Stock ID, Part No, Serial No, Engine No..."
                            className="w-full rounded-lg border px-3 py-2"
                        />

                    </div>

                </div>

            </div>


            {/* SUMMARY */}

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">

                <div className="rounded-xl bg-white p-5 shadow">

                    <div className="text-sm text-slate-500">
                        Total Stock
                    </div>

                    <div className="mt-1 text-2xl font-bold">
                        {
                            filteredStock.length
                        }
                    </div>

                </div>


                <div className="rounded-xl bg-white p-5 shadow">

                    <div className="text-sm text-slate-500">
                        Available
                    </div>

                    <div className="mt-1 text-2xl font-bold text-green-600">
                        {
                            filteredStock.filter(
                                x =>
                                    x.Status ===
                                    "Available"
                            ).length
                        }
                    </div>

                </div>


                <div className="rounded-xl bg-white p-5 shadow">

                    <div className="text-sm text-slate-500">
                        Branch
                    </div>

                    <div className="mt-1 text-lg font-bold">

                        {selectedBranch ===
                        "ALL"
                            ? "All Branches"
                            : selectedBranch}

                    </div>

                </div>


                <div className="rounded-xl bg-white p-5 shadow">

                    <div className="text-sm text-slate-500">
                        Selected Records
                    </div>

                    <div className="mt-1 text-2xl font-bold">
                        {
                            filteredStock.length
                        }
                    </div>

                </div>

            </div>


            {/* STOCK TABLE */}

            <div className="overflow-x-auto rounded-xl bg-white shadow">

                <table className="min-w-[1700px] w-full text-sm">

                    <thead className="bg-slate-100">

                        <tr>

                            <th className="p-3 text-left">
                                Stock ID
                            </th>

                            <th className="p-3 text-left">
                                Global Stock No
                            </th>

                            <th className="p-3 text-left">
                                Branch Stock ID
                            </th>

                            <th className="p-3 text-left">
                                Branch
                            </th>

                            <th className="p-3 text-left">
                                Part No
                            </th>

                            <th className="p-3 text-left">
                                Serial No
                            </th>

                            <th className="p-3 text-left">
                                Engine No
                            </th>

                            <th className="p-3 text-left">
                                Frame No
                            </th>

                            <th className="p-3 text-left">
                                Consignment
                            </th>

                            <th className="p-3 text-left">
                                Item Ref
                            </th>

                            <th className="p-3 text-left">
                                Report No
                            </th>

                            <th className="p-3 text-left">
                                Status
                            </th>

                            <th className="p-3 text-left">
                                Created
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredStock.map(
                            item => (

                                <tr
                                    key={
                                        item.StockID
                                    }
                                    className="border-b hover:bg-slate-50"
                                >

                                    <td className="p-3">
                                        {
                                            item.StockID
                                        }
                                    </td>


                                    <td className="p-3 font-semibold">
                                        {
                                            item.GlobalStockNo
                                        }
                                    </td>


                                    <td className="p-3 font-semibold">
                                        {
                                            item.BranchStockID
                                        }
                                    </td>


                                    <td className="p-3">

                                        <div className="font-medium">
                                            {
                                                item.BranchName
                                            }
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            {
                                                item.BranchCode
                                            }
                                        </div>

                                    </td>


                                    <td className="p-3">
                                        {
                                            item.PartNo
                                        }
                                    </td>


                                    <td className="p-3">
                                        {
                                            item.SerialNo
                                        }
                                    </td>


                                    <td className="p-3">
                                        {
                                            item.ENO
                                        }
                                    </td>


                                    <td className="p-3">
                                        {
                                            item.FNO
                                        }
                                    </td>


                                    <td className="p-3">
                                        {
                                            item.ConsignmentNo
                                        }
                                    </td>


                                    <td className="p-3">
                                        {
                                            item.ConsignmentItemNo
                                        }
                                    </td>


                                    <td className="p-3">
                                        {
                                            item.ReportNo
                                        }
                                    </td>


                                    <td className="p-3">

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                item.Status ===
                                                "Available"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            {
                                                item.Status
                                            }
                                        </span>

                                    </td>


                                    <td className="p-3">
                                        {
                                            item.CreatedDate
                                                ? new Date(
                                                    item.CreatedDate
                                                ).toLocaleDateString()
                                                : ""
                                        }
                                    </td>

                                </tr>

                            )
                        )}


                        {!loading &&
                            filteredStock.length ===
                                0 && (

                                <tr>

                                    <td
                                        colSpan={13}
                                        className="p-10 text-center text-slate-500"
                                    >
                                        No stock found.
                                    </td>

                                </tr>

                            )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}