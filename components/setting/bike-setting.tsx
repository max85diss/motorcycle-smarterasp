

"use client";

import { useEffect, useState } from "react";

interface Item {
  PartNo: string;
  Type: string;
  Model: string;
  Color: string;
  Price: number | string;
  Description: string;
  Status: string;
}

const emptyItem: Item = {
  PartNo: "",
  Type: "",
  Model: "",
  Color: "",
  Price: "",
  Description: "",
  Status: "Active",
};

export default function ItemsPage() {

  const [form, setForm] = useState<Item>(emptyItem);

  const [items, setItems] = useState<Item[]>([]);

  const [isEdit, setIsEdit] = useState(false);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);


  // --------------------------------
  // Load Items
  // --------------------------------

  async function loadItems() {

    try {

      setLoading(true);

      const response = await fetch("/api/setting/bike");

      const data = await response.json();

      if (data.success) {
        setItems(data.data || []);
      }

    } catch (error) {

      console.error(error);

     // alert("Unable to load items.");

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadItems();

  }, []);


  // --------------------------------
  // Handle Input
  // --------------------------------

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) {

    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value,
    }));

  }


  // --------------------------------
  // Save / Update
  // --------------------------------

  async function saveItem() {

    if (!form.PartNo.trim()) {

      alert("Part No is required.");

      return;

    }

    if (!form.Type.trim()) {

      alert("Type is required.");

      return;

    }

    if (!form.Model.trim()) {

      alert("Model is required.");

      return;

    }

    try {

      setLoading(true);

      const response = await fetch(
        isEdit
          ? `/api/setting/bike/${encodeURIComponent(form.PartNo)}`
          : "/api/setting/bike",
        {
          method: isEdit ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(form),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message || "Operation failed."
        );

      }


      alert(data.message);

      clearForm();

      await loadItems();

    } catch (error) {

      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to save item."
      );

    } finally {

      setLoading(false);

    }

  }


  // --------------------------------
  // Edit
  // --------------------------------

  function editItem(item: Item) {

    setForm({
      PartNo: item.PartNo,
      Type: item.Type ?? "",
      Model: item.Model ?? "",
      Color: item.Color ?? "",
      Price: item.Price ?? "",
      Description: item.Description ?? "",
      Status: item.Status ?? "Active",
    });

    setIsEdit(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }


  // --------------------------------
  // Clear
  // --------------------------------

  function clearForm() {

    setForm(emptyItem);

    setIsEdit(false);

  }


  // --------------------------------
  // Search
  // --------------------------------

  const filteredItems = items.filter(item => {

    const text = search.toLowerCase();

    return (
      item.PartNo?.toLowerCase().includes(text) ||
      item.Type?.toLowerCase().includes(text) ||
      item.Model?.toLowerCase().includes(text) ||
      item.Color?.toLowerCase().includes(text) ||
      item.Description?.toLowerCase().includes(text)
    );

  });


  return (

    <div className="min-h-screen bg-slate-100 p-4 md:p-6">


      {/* Page Header */}

      <div className="mb-6">

        <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
          Item Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage item, model, price and status information.
        </p>

      </div>



      {/* FORM */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">


        <div className="bg-slate-800 px-5 py-4">

          <h2 className="text-lg font-semibold text-white">

            {isEdit
              ? "Edit Item"
              : "Add New Item"}

          </h2>

        </div>



        <div className="p-5 md:p-6">


          <div className="
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
            lg:grid-cols-3
          ">


            {/* Part No */}

            <div>

              <label className="
                mb-1
                block
                text-sm
                font-medium
                text-slate-700
              ">
                Part No *
              </label>

              <input
                type="text"
                name="PartNo"
                value={form.PartNo}
                onChange={handleChange}
                readOnly={isEdit}
                placeholder="Enter part number"
                className={`
                  w-full
                  rounded-lg
                  border
                  px-3
                  py-2.5
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  ${
                    isEdit
                      ? "bg-slate-100 text-slate-500"
                      : "bg-white"
                  }
                `}
              />

            </div>



            {/* Type */}

            <div>

              <label className="
                mb-1
                block
                text-sm
                font-medium
                text-slate-700
              ">
                Type *
              </label>

              <input
                type="text"
                name="Type"
                value={form.Type}
                onChange={handleChange}
                placeholder="Example: Motorcycle"
                className="
                  w-full
                  rounded-lg
                  border
                  px-3
                  py-2.5
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

            </div>



            {/* Model */}

            <div>

              <label className="
                mb-1
                block
                text-sm
                font-medium
                text-slate-700
              ">
                Model *
              </label>

              <input
                type="text"
                name="Model"
                value={form.Model}
                onChange={handleChange}
                placeholder="Enter model"
                className="
                  w-full
                  rounded-lg
                  border
                  px-3
                  py-2.5
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

            </div>



            {/* Color */}

            <div>

              <label className="
                mb-1
                block
                text-sm
                font-medium
                text-slate-700
              ">
                Color
              </label>

              <input
                type="text"
                name="Color"
                value={form.Color}
                onChange={handleChange}
                placeholder="Enter color"
                className="
                  w-full
                  rounded-lg
                  border
                  px-3
                  py-2.5
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

            </div>



            {/* Price */}

            <div>

              <label className="
                mb-1
                block
                text-sm
                font-medium
                text-slate-700
              ">
                Price
              </label>

              <input
                type="number"
                name="Price"
                value={form.Price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="
                  w-full
                  rounded-lg
                  border
                  px-3
                  py-2.5
                  text-right
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

            </div>



            {/* Status */}

            <div>

              <label className="
                mb-1
                block
                text-sm
                font-medium
                text-slate-700
              ">
                Status
              </label>

              <select
                name="Status"
                value={form.Status}
                onChange={handleChange}
                className="
                  w-full
                  rounded-lg
                  border
                  px-3
                  py-2.5
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
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



            {/* Description */}

            <div className="md:col-span-2 lg:col-span-3">

              <label className="
                mb-1
                block
                text-sm
                font-medium
                text-slate-700
              ">
                Description
              </label>

              <textarea
                name="Description"
                value={form.Description}
                onChange={handleChange}
                rows={3}
                placeholder="Enter item description"
                className="
                  w-full
                  resize-none
                  rounded-lg
                  border
                  px-3
                  py-2.5
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

            </div>

          </div>



          {/* Buttons */}

          <div className="
            mt-6
            flex
            flex-wrap
            gap-3
          ">

            <button
              type="button"
              onClick={saveItem}
              disabled={loading}
              className="
                rounded-lg
                bg-blue-600
                px-6
                py-2.5
                font-medium
                text-white
                transition
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
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
              className="
                rounded-lg
                bg-slate-500
                px-6
                py-2.5
                font-medium
                text-white
                transition
                hover:bg-slate-600
              "
            >
              Clear
            </button>

          </div>

        </div>

      </div>



      {/* TABLE */}

      <div className="
        mt-8
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-sm
      ">


        {/* Table Header */}

        <div className="
          flex
          flex-col
          gap-4
          border-b
          p-5
          md:flex-row
          md:items-center
          md:justify-between
        ">

          <div>

            <h2 className="
              text-lg
              font-semibold
              text-slate-800
            ">
              Item List
            </h2>

            <p className="
              text-sm
              text-slate-500
            ">
              {filteredItems.length} item(s)
            </p>

          </div>


          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search items..."
            className="
              w-full
              rounded-lg
              border
              px-4
              py-2.5
              outline-none
              focus:ring-2
              focus:ring-blue-500
              md:w-80
            "
          />

        </div>



        {/* Responsive Table */}

        <div className="overflow-x-auto">

          <table className="
            min-w-[950px]
            w-full
            border-collapse
          ">

            <thead>

              <tr className="bg-slate-50">

                <th className="
                  border-b
                  px-4
                  py-3
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  text-slate-600
                ">
                  Action
                </th>

                <th className="
                  border-b
                  px-4
                  py-3
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  text-slate-600
                ">
                  Part No
                </th>

                <th className="
                  border-b
                  px-4
                  py-3
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  text-slate-600
                ">
                  Type
                </th>

                <th className="
                  border-b
                  px-4
                  py-3
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  text-slate-600
                ">
                  Model
                </th>

                <th className="
                  border-b
                  px-4
                  py-3
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  text-slate-600
                ">
                  Color
                </th>

                <th className="
                  border-b
                  px-4
                  py-3
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  text-slate-600
                ">
                  Price
                </th>

                <th className="
                  border-b
                  px-4
                  py-3
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  text-slate-600
                ">
                  Description
                </th>

                <th className="
                  border-b
                  px-4
                  py-3
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  text-slate-600
                ">
                  Status
                </th>

              </tr>

            </thead>



            <tbody>

              {filteredItems.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="
                      px-4
                      py-10
                      text-center
                      text-slate-500
                    "
                  >
                    No items found.
                  </td>

                </tr>

              ) : (

                filteredItems.map((item) => (

                  <tr
                    key={item.PartNo}
                    className="
                      border-b
                      transition
                      hover:bg-slate-50
                    "
                  >

                    <td className="px-4 py-3">

                      <button
                        type="button"
                        onClick={() =>
                          editItem(item)
                        }
                        className="
                          rounded-lg
                          bg-indigo-600
                          px-4
                          py-1.5
                          text-sm
                          font-medium
                          text-white
                          hover:bg-indigo-700
                        "
                      >
                        Edit
                      </button>

                    </td>


                    <td className="
                      px-4
                      py-3
                      font-semibold
                      text-slate-800
                    ">
                      {item.PartNo}
                    </td>


                    <td className="px-4 py-3">
                      {item.Type}
                    </td>


                    <td className="
                      px-4
                      py-3
                      font-medium
                    ">
                      {item.Model}
                    </td>


                    <td className="px-4 py-3">
                      {item.Color}
                    </td>


                    <td className="
                      px-4
                      py-3
                      text-right
                      font-medium
                    ">
                      {Number(item.Price || 0).toLocaleString(
                        "en-LK",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </td>


                    <td className="
                      max-w-xs
                      truncate
                      px-4
                      py-3
                      text-slate-600
                    ">
                      {item.Description}
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

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}

