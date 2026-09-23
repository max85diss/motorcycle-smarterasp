"use client";

import { useEffect, useState } from "react";

interface Consignment {
  SysNo: string;
  BranchConNo: string;
  Date: string;
  APED: string;
}

interface OtherItem {
  ItemCode: string;
  Description: string;
  Status: string;
}

interface StockItem {
  ID: number;
  ConsignmentNo: string;
  ItemCode: string;
  ItemDescription: string;
  ReqQTY: number;
  ReceivedQTY: number;
  Different: number;
  Date: string;
  APED: string;
}

const emptyForm = {
  ConsignmentNo: "",
  ItemCode: "",
  Description: "",
  ReqQTY: "",
  ReceivedQTY: "",
  Date: new Date()
    .toISOString()
    .substring(0, 10),
};

export default function ConsignmentOtherStockPage() {

  const [consignments, setConsignments] =
    useState<Consignment[]>([]);

  const [otherItems, setOtherItems] =
    useState<OtherItem[]>([]);

  const [items, setItems] =
    useState<StockItem[]>([]);

  const [form, setForm] =
    useState(emptyForm);

  const [editingID, setEditingID] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {

    await Promise.all([
      loadConsignments(),
      loadOtherItems(),
      loadItems(),
    ]);
  }

  async function loadConsignments() {

    try {

      const res =
        await fetch("/api/consignment-other-items/consignment");

      const data =
        await res.json();

      setConsignments(
        Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : []
      );

    } catch (error) {

      console.error(error);

      setConsignments([]);

    }
  }

  async function loadOtherItems() {

    try {

      const res =
        await fetch("/api/consignment-other-items/other-item-details");

      const data =
        await res.json();

      setOtherItems(
        Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : []
      );

    } catch (error) {

      console.error(error);

      setOtherItems([]);

    }
  }

  async function loadItems() {

    try {

      const res =
        await fetch(
          "/api/consignment-other-items"
        );

      const data =
        await res.json();

      setItems(
        Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : []
      );

    } catch (error) {

      console.error(error);

      setItems([]);

    }
  }

  function handleItemChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {

    const itemCode =
      e.target.value;

    const selected =
      otherItems.find(
        x => x.ItemCode === itemCode
      );

    if (!selected) {

      setForm({
        ...form,
        ItemCode: "",
        Description: "",
      });

      return;
    }

    setForm({
      ...form,
      ItemCode: selected.ItemCode,
      Description:
        selected.Description,
    });
  }

  function handleQtyChange(
    field: "ReqQTY" | "ReceivedQTY",
    value: string
  ) {

    setForm({
      ...form,
      [field]: value,
    });
  }

  function getDifferent() {

    const req =
      Number(form.ReqQTY || 0);

    const received =
      Number(form.ReceivedQTY || 0);

    return req - received;
  }

  async function saveItem() {

    if (!form.ConsignmentNo) {
      alert("Please select Consignment No");
      return;
    }

    if (!form.ItemCode) {
      alert("Please select Item");
      return;
    }

    if (
      Number(form.ReqQTY || 0) < 0 ||
      Number(form.ReceivedQTY || 0) < 0
    ) {
      alert("Quantity cannot be negative");
      return;
    }

    setLoading(true);

    try {

      const url = editingID
        ? `/api/consignment-other-items/${editingID}`
        : "/api/consignment-other-items";

      const method =
        editingID ? "PUT" : "POST";

      const res = await fetch(
        url,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {

        alert(
          data.message ||
          "Failed to save item"
        );

        return;
      }

      alert(
        editingID
          ? "Item updated"
          : "Item saved"
      );

      clearForm();

      await loadItems();

    } finally {

      setLoading(false);

    }
  }

  function editItem(item: StockItem) {

    setEditingID(item.ID);

    setForm({
      ConsignmentNo:
        item.ConsignmentNo,

      ItemCode:
        item.ItemCode,

      Description:
        item.ItemDescription,

      ReqQTY:
        item.ReqQTY.toString(),

      ReceivedQTY:
        item.ReceivedQTY.toString(),

      Date:
        item.Date.substring(0, 10),
    });
  }

  async function deleteItem(
    id: number
  ) {

    if (
      !confirm(
        "Are you sure you want to delete this item?"
      )
    ) {
      return;
    }

    const res = await fetch(
      `/api/consignment-other-items/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {

      alert("Unable to delete item");

      return;
    }

    await loadItems();

  }

  function clearForm() {

    setEditingID(null);

    setForm({
      ...emptyForm,
      Date: new Date()
        .toISOString()
        .substring(0, 10),
    });

  }

  async function sendApproval() {

    const consignmentNo =
      form.ConsignmentNo;

    if (!consignmentNo) {

      alert(
        "Please select a consignment"
      );

      return;
    }

    const count =
      items.filter(
        x =>
          x.ConsignmentNo ===
          consignmentNo &&
          x.APED === "Entering"
      ).length;

    if (count === 0) {

      alert(
        "There are no Entering items for this consignment."
      );

      return;
    }

    if (
      !confirm(
        "Send all items of this consignment to approval?"
      )
    ) {
      return;
    }

    const res = await fetch(
      "/api/consignment-other-items/send-approval",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          ConsignmentNo:
            consignmentNo,
        }),
      }
    );

    const data =
      await res.json();

    if (!res.ok) {

      alert(
        data.message ||
        "Failed to send approval"
      );

      return;
    }

    alert(
      "Consignment items sent to approval."
    );

    clearForm();

    await loadItems();
  }

  return (
    <div className="p-4 md:p-6">

      <div className="mb-6">

        <h1 className="text-2xl font-bold">
          Consignment Other Items
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Add received items to consignment
          stock
        </p>

      </div>

      {/* FORM */}

      <div className="rounded-lg border bg-white p-5 shadow">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* CONSIGNMENT */}

          <div>

            <label className="block mb-1 text-sm font-medium">
              Consignment No
            </label>

            <select
              value={form.ConsignmentNo}
              onChange={(e) =>
                setForm({
                  ...form,
                  ConsignmentNo:
                    e.target.value,
                })
              }
              className="w-full rounded border px-3 py-2"
            >

              <option value="">
                -- Select Consignment --
              </option>

              {consignments.map(
                item => (
                  <option
                    key={item.SysNo}
                    value={item.SysNo}
                  >
                    {item.SysNo}

                  </option>
                )
              )}

            </select>

          </div>

          {/* ITEM DESCRIPTION */}

          <div>

            <label className="block mb-1 text-sm font-medium">
              Item Description
            </label>

            <select
              value={form.ItemCode}
              onChange={handleItemChange}
              className="w-full rounded border px-3 py-2"
            >

              <option value="">
                -- Select Item --
              </option>

              {otherItems.map(
                item => (
                  <option
                    key={item.ItemCode}
                    value={item.ItemCode}
                  >
                    {item.Description}
                  </option>
                )
              )}

            </select>

          </div>

          {/* ITEM CODE */}

          <div>

            <label className="block mb-1 text-sm font-medium">
              Item Code
            </label>

            <input
              value={form.ItemCode}
              readOnly
              className="w-full rounded border bg-gray-100 px-3 py-2"
            />

          </div>

          {/* DATE */}

          <div>

            <label className="block mb-1 text-sm font-medium">
              Date
            </label>

            <input
              type="date"
              value={form.Date}
              onChange={(e) =>
                setForm({
                  ...form,
                  Date: e.target.value,
                })
              }
              className="w-full rounded border px-3 py-2"
            />

          </div>

          {/* REQUESTED QTY */}

          <div>

            <label className="block mb-1 text-sm font-medium">
              Req. QTY
            </label>

            <input
              type="number"
              min="0"
              step="0.001"
              value={form.ReqQTY}
              onChange={(e) =>
                handleQtyChange(
                  "ReqQTY",
                  e.target.value
                )
              }
              className="w-full rounded border px-3 py-2"
            />

          </div>

          {/* RECEIVED QTY */}

          <div>

            <label className="block mb-1 text-sm font-medium">
              Received QTY
            </label>

            <input
              type="number"
              min="0"
              step="0.001"
              value={form.ReceivedQTY}
              onChange={(e) =>
                handleQtyChange(
                  "ReceivedQTY",
                  e.target.value
                )
              }
              className="w-full rounded border px-3 py-2"
            />

          </div>

          {/* DIFFERENCE */}

          <div>

            <label className="block mb-1 text-sm font-medium">
              Different
            </label>

            <input
              value={getDifferent()}
              readOnly
              className="w-full rounded border bg-gray-100 px-3 py-2"
            />

          </div>

        </div>

        {/* BUTTONS */}

        <div className="flex flex-wrap gap-3 mt-5">

          <button
            type="button"
            onClick={saveItem}
            disabled={loading}
            className="rounded bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {editingID
              ? "Update"
              : "Add"}
          </button>

          <button
            type="button"
            onClick={clearForm}
            className="rounded bg-gray-500 px-5 py-2 text-white hover:bg-gray-600"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={sendApproval}
            className="rounded bg-orange-600 px-5 py-2 text-white hover:bg-orange-700"
          >
            Send to Approval
          </button>

        </div>

      </div>

      {/* TABLE */}

      <div className="mt-6 overflow-x-auto rounded-lg border bg-white shadow">

        <table className="min-w-[1100px] w-full text-sm">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">
                Consignment No
              </th>

              <th className="p-3 text-left">
                Item Code
              </th>

              <th className="p-3 text-left">
                Item Description
              </th>

              <th className="p-3 text-right">
                Req. QTY
              </th>

              <th className="p-3 text-right">
                Received QTY
              </th>

              <th className="p-3 text-right">
                Different
              </th>

              <th className="p-3 text-left">
                Date
              </th>

              <th className="p-3 text-left">
                State
              </th>

              <th className="p-3 text-center">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {items.length === 0 ? (

              <tr>

                <td
                  colSpan={9}
                  className="p-6 text-center text-gray-500"
                >
                  No items found
                </td>

              </tr>

            ) : (

              items.map(item => (

                <tr
                  key={item.ID}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="p-3">
                    {item.ConsignmentNo}
                  </td>

                  <td className="p-3">
                    {item.ItemCode}
                  </td>

                  <td className="p-3">
                    {item.ItemDescription}
                  </td>

                  <td className="p-3 text-right">
                    {item.ReqQTY}
                  </td>

                  <td className="p-3 text-right">
                    {item.ReceivedQTY}
                  </td>

                  <td className="p-3 text-right">
                    {item.Different}
                  </td>

                  <td className="p-3">
                    {item.Date.substring(0, 10)}
                  </td>

                  <td className="p-3">
                    {item.APED}
                  </td>

                  <td className="p-3">

                    {item.APED ===
                      "Entering" && (

                      <div className="flex justify-center gap-2">

                        <button
                          onClick={() =>
                            editItem(item)
                          }
                          className="rounded bg-blue-600 px-3 py-1 text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteItem(
                              item.ID
                            )
                          }
                          className="rounded bg-red-600 px-3 py-1 text-white"
                        >
                          Delete
                        </button>

                      </div>

                    )}

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}