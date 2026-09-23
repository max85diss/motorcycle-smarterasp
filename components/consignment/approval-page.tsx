"use client";

import { useEffect, useState } from "react";

interface Consignment {
    SysNo: string;
    Date: string;
    ConNO: string;
    NoOfItems: number;
    APED: string;
    BranchCode: string;
    BranchName: string;
    EmpCode: string;
    EmpName: string;
    BranchConNo: string;
}

interface ConsignmentItem {
    No: number;
    SysRefNo: string;
    SerialNo: string;
    PartNo: string;
    ENO: string;
    FNO: string;
    Remark: string;
    Status: string;
    ReportNo: string;
}

export default function ConsignmentAdminPage() {

    const [status, setStatus] =
        useState("AP");

    const [list, setList] =
        useState<Consignment[]>([]);

    const [items, setItems] =
        useState<ConsignmentItem[]>([]);

    const [selected, setSelected] =
        useState<Consignment | null>(null);


    async function loadList() {

        const response =
            await fetch(
                `/api/consignment/admin?status=${status}`
            );

        const data =
            await response.json();

        if (data.success) {
            setList(data.data);
        }

    }


    useEffect(() => {

        loadList();

    }, [status]);


    async function viewItems(
        item: Consignment
    ) {

        setSelected(item);


        const response =
            await fetch(
                `/api/consignment/consignment-items?sysNo=${encodeURIComponent(
                    item.SysNo
                )}`
            );


        const data =
            await response.json();


        if (data.success) {
            setItems(data.data);
        }

    }


    async function approve() {

        if (!selected) return;


        const response =
            await fetch(
                `/api/consignment/admin/${encodeURIComponent(
                    selected.SysNo
                )}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        action: "APPROVE"
                    })
                }
            );


        const data =
            await response.json();


        alert(data.message);


        if (response.ok) {

            setSelected(null);

            setItems([]);

            await loadList();

        }

    }


    return (

        <div className="min-h-screen bg-slate-100 p-6">

            <h1 className="mb-6 text-2xl font-bold">
                Consignment Approval
            </h1>


            {/* STATUS TABS */}

            <div className="mb-5 flex gap-2">

                <button
                    onClick={() =>
                        setStatus("Entering")
                    }
                    className="rounded-lg bg-slate-600 px-5 py-2 text-white"
                >
                    Entering
                </button>


                <button
                    onClick={() =>
                        setStatus("AP")
                    }
                    className="rounded-lg bg-blue-600 px-5 py-2 text-white"
                >
                    Pending Approval
                </button>


                <button
                    onClick={() =>
                        setStatus("APED")
                    }
                    className="rounded-lg bg-green-600 px-5 py-2 text-white"
                >
                    Approved
                </button>

            </div>


            {/* CONSIGNMENT TABLE */}

            <div className="overflow-x-auto rounded-xl bg-white shadow">

                <table className="min-w-[1100px] w-full">

                    <thead>

                        <tr className="bg-slate-100">

                            <th className="p-3 text-left">
                                Action
                            </th>

                            <th className="p-3 text-left">
                                Sys No
                            </th>

                            <th className="p-3 text-left">
                                Branch
                            </th>

                            <th className="p-3 text-left">
                                Branch Con No
                            </th>

                            <th className="p-3 text-left">
                                Date
                            </th>

                            <th className="p-3 text-left">
                                Employee
                            </th>

                            <th className="p-3 text-center">
                                Items
                            </th>

                            <th className="p-3 text-left">
                                Status
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {list.map(item => (

                            <tr
                                key={item.SysNo}
                                className="border-b"
                            >

                                <td className="p-3">

                                    <button
                                        onClick={() =>
                                            viewItems(item)
                                        }
                                        className="rounded bg-indigo-600 px-3 py-1 text-sm text-white"
                                    >
                                        View
                                    </button>

                                </td>

                                <td className="p-3 font-semibold">
                                    {item.SysNo}
                                </td>

                                <td className="p-3">
                                    {item.BranchName}
                                </td>

                                <td className="p-3">
                                    {item.BranchConNo}
                                </td>

                                <td className="p-3">
                                    {item.Date}
                                </td>

                                <td className="p-3">
                                    {item.EmpName}
                                </td>

                                <td className="p-3 text-center">
                                    {item.NoOfItems}
                                </td>

                                <td className="p-3">
                                    {item.APED}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>


            {/* ITEMS */}

            {selected && (

                <div className="mt-6 rounded-xl bg-white p-5 shadow">

                    <div className="mb-4 flex items-center justify-between">

                        <div>

                            <h2 className="text-lg font-bold">
                                Consignment Items
                            </h2>

                            <p className="text-sm text-slate-500">
                                {selected.SysNo}
                            </p>

                        </div>

                        <div>
                            {selected.APED === "AP" && (

                            <button
                                onClick={approve}
                                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white "
                            >
                                Sendback
                            </button>

                        )}

                        {selected.APED === "AP" && (

                            <button
                                onClick={approve}
                                className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white ms-2"
                            >
                                Approve Consignment
                            </button>

                        )}

                        </div>

                        

                    </div>


                    <div className="overflow-x-auto">

                        <table className="min-w-[1100px] w-full">

                            <thead>

                                <tr className="bg-slate-100">

                                    <th className="p-3">
                                        Sys Ref
                                    </th>

                                    <th className="p-3">
                                        Serial No
                                    </th>

                                    <th className="p-3">
                                        Part No
                                    </th>

                                    <th className="p-3">
                                        ENO
                                    </th>

                                    <th className="p-3">
                                        FNO
                                    </th>

                                    <th className="p-3">
                                        Report No
                                    </th>

                                    <th className="p-3">
                                        Remark
                                    </th>

                                    <th className="p-3">
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {items.map(item => (

                                    <tr
                                        key={item.No}
                                        className="border-b"
                                    >

                                        <td className="p-3 font-semibold">
                                            {item.SysRefNo}
                                        </td>

                                        <td className="p-3">
                                            {item.SerialNo}
                                        </td>

                                        <td className="p-3">
                                            {item.PartNo}
                                        </td>

                                        <td className="p-3">
                                            {item.ENO}
                                        </td>

                                        <td className="p-3">
                                            {item.FNO}
                                        </td>

                                        <td className="p-3">
                                            {item.ReportNo}
                                        </td>

                                        <td className="p-3">
                                            {item.Remark}
                                        </td>

                                        <td className="p-3">
                                            {item.Status}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
}