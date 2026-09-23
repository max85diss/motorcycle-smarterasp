
"use client";

import { useEffect, useState } from "react";

interface OtherItem {
  ID: number;
  ItemCode: string;
  Description: string;
  IssuedAmountForInvoice: number | string;
  IsItConsignmentItem: boolean;
  IsItFreeItem: boolean;
  SalesPrice: number | string;
  Status: string;
}

const emptyForm: OtherItem = {
  ID: 0,
  ItemCode: "",
  Description: "",
  IssuedAmountForInvoice: "",
  IsItConsignmentItem: false,
  IsItFreeItem: false,
  SalesPrice: "",
  Status: "Active",
};

export default function OtherItemsPage() {

  const [form, setForm] =
    useState<OtherItem>(emptyForm);

  const [items, setItems] =
    useState<OtherItem[]>([]);

  const [isEdit, setIsEdit] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");


  // --------------------------------
  // Load Items
  // --------------------------------

  async function loadItems() {

    try {

      setLoading(true);

      const response = await fetch(
        "/api/setting/other-items"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to load items."
        );
      }

      setItems(data.data || []);

    } catch (error) {

      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to load items."
      );

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

    const {
      name,
      value
    } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value,
    }));

  }


  // --------------------------------
  // Checkbox
  // --------------------------------

  function handleCheckbox(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const {
      name,
      checked
    } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: checked,
    }));

  }


  // --------------------------------
  // Save / Update
  // --------------------------------

  async function saveItem() {

    if (!form.Description.trim()) {

      alert(
        "Description is required."
      );

      return;

    }


    if (
      form.IssuedAmountForInvoice === "" ||
      Number(form.IssuedAmountForInvoice) < 0
    ) {

      alert(
        "Please enter a valid issued amount."
      );

      return;

    }


    if (
      form.SalesPrice === "" ||
      Number(form.SalesPrice) < 0
    ) {

      alert(
        "Please enter a valid sales price."
      );

      return;

    }


    try {

      setLoading(true);


      const url = isEdit
        ? `/api/setting/other-items/${encodeURIComponent(
            form.ItemCode
          )}`
        : "/api/setting/other-items";


      const method = isEdit
        ? "PUT"
        : "POST";


      const response = await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            Description:
              form.Description,

            IssuedAmountForInvoice:
              Number(
                form.IssuedAmountForInvoice
              ),

            IsItConsignmentItem:
              form.IsItConsignmentItem,

            IsItFreeItem:
              form.IsItFreeItem,

            SalesPrice:
              Number(form.SalesPrice),

            Status:
              form.Status,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Operation failed."
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

  function editItem(item: OtherItem) {

    setForm({
      ID: item.ID,

      ItemCode:
        item.ItemCode ?? "",

      Description:
        item.Description ?? "",

      IssuedAmountForInvoice:
        item.IssuedAmountForInvoice ?? "",

      IsItConsignmentItem:
        Boolean(
          item.IsItConsignmentItem
        ),

      IsItFreeItem:
        Boolean(
          item.IsItFreeItem
        ),

      SalesPrice:
        item.SalesPrice ?? "",

      Status:
        item.Status ?? "Active",
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

    setForm(emptyForm);

    setIsEdit(false);

  }


  // --------------------------------
  // Search
  // --------------------------------

  const filteredItems =
    items.filter(item => {

      const text =
        search.toLowerCase();

      return (
        item.ItemCode
          ?.toLowerCase()
          .includes(text) ||

        item.Description
          ?.toLowerCase()
          .includes(text) ||

        item.Status
          ?.toLowerCase()
          .includes(text)
      );

    });


  return (

    <div className="
      min-h-screen
      bg-slate-100
      p-4
      md:p-6
    ">


      {/* PAGE HEADER */}

      <div className="mb-6">

        <h1 className="
          text-2xl
          font-bold
          text-slate-800
          md:text-3xl
        ">
          Other Item Details
        </h1>

        <p className="
          mt-1
          text-sm
          text-slate-500
        ">
          Manage other invoice and sales items.
        </p>

      </div>



      {/* FORM */}

      <div className="
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-sm
      ">


        <div className="
          bg-slate-800
          px-5
          py-4
        ">

          <h2 className="
            text-lg
            font-semibold
            text-white
          ">

            {isEdit
              ? "Edit Other Item"
              : "Add Other Item"}

          </h2>

        </div>



        <div className="
          p-5
          md:p-6
        ">


          <div className="
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
            lg:grid-cols-3
          ">


            {/* ITEM CODE */}

            <div>

              <label className="
                mb-1
                block
                text-sm
                font-medium
                text-slate-700
              ">
                Item Code
              </label>

              <input
                type="text"
                value={
                  form.ItemCode ||
                  "Auto Generated"
                }
                readOnly
                className="
                  w-full
                  rounded-lg
                  border
                  bg-slate-100
                  px-3
                  py-2.5
                  font-semibold
                  text-slate-600
                "
              />

            </div>



            {/* DESCRIPTION */}

            <div className="
              md:col-span-2
              lg:col-span-2
            ">

              <label className="
                mb-1
                block
                text-sm
                font-medium
                text-slate-700
              ">
                Description *
              </label>

              <input
                type="text"
                name="Description"
                value={form.Description}
                onChange={handleChange}
                placeholder="Enter item description"
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



            {/* ISSUED AMOUNT */}

            <div>

              <label className="
                mb-1
                block
                text-sm
                font-medium
                text-slate-700
              ">
                Issued Amount For Invoice
              </label>

              <input
                type="number"
                name="IssuedAmountForInvoice"
                value={
                  form.IssuedAmountForInvoice
                }
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



            {/* SALES PRICE */}

            <div>

              <label className="
                mb-1
                block
                text-sm
                font-medium
                text-slate-700
              ">
                Sales Price
              </label>

              <input
                type="number"
                name="SalesPrice"
                value={form.SalesPrice}
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



            {/* STATUS */}

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



            {/* CONSIGNMENT */}

            <div className="
              flex
              items-center
            ">

              <label className="
                flex
                cursor-pointer
                items-center
                gap-3
              ">

                <input
                  type="checkbox"
                  name="IsItConsignmentItem"
                  checked={
                    form.IsItConsignmentItem
                  }
                  onChange={
                    handleCheckbox
                  }
                  className="
                    h-5
                    w-5
                    rounded
                    border-slate-300
                  "
                />

                <span className="
                  text-sm
                  font-medium
                  text-slate-700
                ">
                  Is It Consignment Item?
                </span>

              </label>

            </div>



            {/* FREE ITEM */}

            <div className="
              flex
              items-center
            ">

              <label className="
                flex
                cursor-pointer
                items-center
                gap-3
              ">

                <input
                  type="checkbox"
                  name="IsItFreeItem"
                  checked={
                    form.IsItFreeItem
                  }
                  onChange={
                    handleCheckbox
                  }
                  className="
                    h-5
                    w-5
                    rounded
                    border-slate-300
                  "
                />

                <span className="
                  text-sm
                  font-medium
                  text-slate-700
                ">
                  Is It Free Item?
                </span>

              </label>

            </div>

          </div>



          {/* BUTTONS */}

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


        {/* TABLE HEADER */}

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
              Other Item List
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



        {/* RESPONSIVE TABLE */}

        <div className="overflow-x-auto">

          <table className="
            min-w-[1050px]
            w-full
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
                  Item Code
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
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  text-slate-600
                ">
                  Issued Amount
                </th>

                <th className="
                  border-b
                  px-4
                  py-3
                  text-center
                  text-xs
                  font-semibold
                  uppercase
                  text-slate-600
                ">
                  Consignment
                </th>

                <th className="
                  border-b
                  px-4
                  py-3
                  text-center
                  text-xs
                  font-semibold
                  uppercase
                  text-slate-600
                ">
                  Free Item
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
                  Sales Price
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

                filteredItems.map(
                  item => (

                    <tr
                      key={item.ItemCode}
                      className="
                        border-b
                        hover:bg-slate-50
                      "
                    >

                      <td className="
                        px-4
                        py-3
                      ">

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
                        {item.ItemCode}
                      </td>


                      <td className="
                        px-4
                        py-3
                      ">
                        {item.Description}
                      </td>


                      <td className="
                        px-4
                        py-3
                        text-right
                      ">
                        {Number(
                          item.IssuedAmountForInvoice ||
                          0
                        ).toLocaleString(
                          "en-LK",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </td>


                      <td className="
                        px-4
                        py-3
                        text-center
                      ">

                        {item.IsItConsignmentItem ? (

                          <span className="
                            rounded-full
                            bg-blue-100
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            text-blue-700
                          ">
                            Yes
                          </span>

                        ) : (

                          <span className="
                            rounded-full
                            bg-slate-100
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            text-slate-600
                          ">
                            No
                          </span>

                        )}

                      </td>


                      <td className="
                        px-4
                        py-3
                        text-center
                      ">

                        {item.IsItFreeItem ? (

                          <span className="
                            rounded-full
                            bg-green-100
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            text-green-700
                          ">
                            Yes
                          </span>

                        ) : (

                          <span className="
                            rounded-full
                            bg-slate-100
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            text-slate-600
                          ">
                            No
                          </span>

                        )}

                      </td>


                      <td className="
                        px-4
                        py-3
                        text-right
                        font-medium
                      ">
                        {Number(
                          item.SalesPrice || 0
                        ).toLocaleString(
                          "en-LK",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </td>


                      <td className="
                        px-4
                        py-3
                      ">

                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-semibold

                            ${
                              item.Status ===
                              "Active"

                                ? "bg-green-100 text-green-700"

                                : item.Status ===
                                  "Hold"

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

