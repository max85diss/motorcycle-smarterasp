
"use client";

import { useEffect, useState } from "react";

interface Charge {
  ID: number;
  CHNo: string;
  Description: string;
  Amount: number | string;
  IsItFixed: boolean;
  Status: string;
}

const emptyForm: Charge = {
  ID: 0,
  CHNo: "",
  Description: "",
  Amount: "",
  IsItFixed: false,
  Status: "Active",
};

export default function ChargesPage() {
  const [form, setForm] = useState<Charge>(emptyForm);

  const [charges, setCharges] = useState<Charge[]>([]);

  const [isEdit, setIsEdit] = useState(false);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  // ---------------------------------------
  // Load Charges
  // ---------------------------------------

  async function loadCharges() {
    try {
      setLoading(true);

      const response = await fetch("/api/setting/charge");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load charges.");
      }

      setCharges(data.data || []);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to load charges."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCharges();
  }, []);

  // ---------------------------------------
  // Handle Input
  // ---------------------------------------

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // ---------------------------------------
  // Fixed Checkbox
  // ---------------------------------------

  function handleFixedChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm((prev) => ({
      ...prev,
      IsItFixed: e.target.checked,
    }));
  }

  // ---------------------------------------
  // Save / Update
  // ---------------------------------------

  async function saveCharge() {
    if (!form.Description.trim()) {
      alert("Description is required.");
      return;
    }

    if (
      form.Amount === "" ||
      Number(form.Amount) < 0
    ) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);

      const url = isEdit
        ? `/api/setting/charge/${encodeURIComponent(form.CHNo)}`
        : "/api/setting/charge";

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Description: form.Description,
          Amount: Number(form.Amount),
          IsItFixed: form.IsItFixed,
          Status: form.Status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Operation failed."
        );
      }

      alert(data.message);

      clearForm();

      await loadCharges();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to save charge."
      );
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------
  // Edit
  // ---------------------------------------

  function editCharge(item: Charge) {
    setForm({
      ID: item.ID,
      CHNo: item.CHNo,
      Description: item.Description ?? "",
      Amount: item.Amount ?? "",
      IsItFixed: Boolean(item.IsItFixed),
      Status: item.Status ?? "Active",
    });

    setIsEdit(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ---------------------------------------
  // Clear
  // ---------------------------------------

  function clearForm() {
    setForm(emptyForm);

    setIsEdit(false);
  }

  // ---------------------------------------
  // Search
  // ---------------------------------------

  const filteredCharges = charges.filter(
    (item) => {
      const text = search.toLowerCase();

      return (
        item.CHNo?.toLowerCase().includes(text) ||
        item.Description?.toLowerCase().includes(text) ||
        item.Status?.toLowerCase().includes(text)
      );
    }
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">

      {/* Header */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
          Charge Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage company charges and fixed charges.
        </p>
      </div>

      {/* Form */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        <div className="bg-slate-800 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? "Edit Charge" : "Add New Charge"}
          </h2>
        </div>

        <div className="p-5 md:p-6">

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            {/* ID */}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                ID
              </label>

              <input
                type="text"
                value={
                  form.ID === 0
                    ? "Auto Generated"
                    : form.ID
                }
                readOnly
                className="w-full rounded-lg border bg-slate-100 px-3 py-2.5 text-slate-500"
              />
            </div>

            {/* CHNo */}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Charge No
              </label>

              <input
                type="text"
                value={
                  form.CHNo || "Auto Generated"
                }
                readOnly
                className="w-full rounded-lg border bg-slate-100 px-3 py-2.5 font-semibold text-slate-600"
              />
            </div>

            {/* Description */}

            <div className="md:col-span-2 lg:col-span-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Description *
              </label>

              <input
                type="text"
                name="Description"
                value={form.Description}
                onChange={handleChange}
                placeholder="Enter charge description"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Amount */}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Amount *
              </label>

              <input
                type="number"
                name="Amount"
                value={form.Amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full rounded-lg border px-3 py-2.5 text-right outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                name="Status"
                value={form.Status}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">
                  Active
                </option>

                <option value="Deactive">
                  Deactive
                </option>

                <option value="Hold">
                  Hold
                </option>
              </select>
            </div>

            {/* Fixed */}

            <div className="flex items-center">

              <label className="flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  checked={form.IsItFixed}
                  onChange={handleFixedChange}
                  className="h-5 w-5 rounded border-slate-300"
                />

                <span className="text-sm font-medium text-slate-700">
                  Is It Fixed Charge?
                </span>

              </label>

            </div>

          </div>

          {/* Buttons */}

          <div className="mt-6 flex flex-wrap gap-3">

            <button
              type="button"
              onClick={saveCharge}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEdit
                  ? "Update"
                  : "Save"}
            </button>

            <button
              type="button"
              onClick={clearForm}
              className="rounded-lg bg-slate-500 px-6 py-2.5 font-medium text-white hover:bg-slate-600"
            >
              Clear
            </button>

          </div>

        </div>
      </div>

      {/* Table */}

      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">

        {/* Table Header */}

        <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Charge List
            </h2>

            <p className="text-sm text-slate-500">
              {filteredCharges.length} charge(s)
            </p>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search charges..."
            className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 md:w-80"
          />

        </div>

        {/* Responsive Table */}

        <div className="overflow-x-auto">

          <table className="min-w-[850px] w-full">

            <thead>
              <tr className="bg-slate-50">

                <th className="border-b px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Action
                </th>

              
                <th className="border-b px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  CH No
                </th>

                <th className="border-b px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Description
                </th>

                <th className="border-b px-4 py-3 text-right text-xs font-semibold uppercase text-slate-600">
                  Amount
                </th>

                <th className="border-b px-4 py-3 text-center text-xs font-semibold uppercase text-slate-600">
                  Fixed
                </th>

                <th className="border-b px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Status
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredCharges.length === 0 ? (

                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No charges found.
                  </td>
                </tr>

              ) : (

                filteredCharges.map(
                  (item) => (

                    <tr
                      key={item.CHNo}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="px-4 py-3">

                        <button
                          type="button"
                          onClick={() =>
                            editCharge(item)
                          }
                          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                          Edit
                        </button>

                      </td>

                   
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {item.CHNo}
                      </td>

                      <td className="px-4 py-3">
                        {item.Description}
                      </td>

                      <td className="px-4 py-3 text-right font-medium">
                        {Number(
                          item.Amount || 0
                        ).toLocaleString(
                          "en-LK",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">

                        {item.IsItFixed ? (
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            Yes
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            No
                          </span>
                        )}

                      </td>

                      <td className="px-4 py-3">

                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            ${
                              item.Status === "Active"
                                ? "bg-green-100 text-green-700"
                                : item.Status === "Hold"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }
                          `}
                        >
                          {item.Status}
                        </span>

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