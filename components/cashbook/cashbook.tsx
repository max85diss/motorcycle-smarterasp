
"use client";

import {
  useEffect,
  useState,
} from "react";


interface CashBook {

  GCBNo: string;

  BranchCBNo: string;

  RefNo: string;

  Date: string;

  Description: string;

  DR: number;

  CR: number;

  State: string;

  BranchCode: string;

  BranchName: string;

  EmpCode: string;

  EmpName: string;

}


interface Branch {

  BranchCode: string;

  BranchName: string;

}


const today =
  new Date()
    .toISOString()
    .substring(0, 10);


export default function CashBookPage() {

  const [
    data,
    setData,
  ] = useState<CashBook[]>([]);


  const [
    branches,
    setBranches,
  ] = useState<Branch[]>([]);


  const [
    fromDate,
    setFromDate,
  ] = useState(today);


  const [
    toDate,
    setToDate,
  ] = useState(today);


  const [
    branchCode,
    setBranchCode,
  ] = useState("ALL");


  const [
    totalDR,
    setTotalDR,
  ] = useState(0);


  const [
    totalCR,
    setTotalCR,
  ] = useState(0);


  const [
    balance,
    setBalance,
  ] = useState(0);


  const [
    form,
    setForm,
  ] = useState({

    Date: today,

    RefNo: "",

    Description: "",

    DR: "",

    CR: "",

  });


  const [
    saving,
    setSaving,
  ] = useState(false);


  useEffect(() => {

    loadBranches();

    loadCashBook();

  }, []);


  async function loadBranches() {

    try {

      const res =
        await fetch(
          "/api/cashbook/branches"
        );

      const result =
        await res.json();


      setBranches(
        Array.isArray(result.data)
          ? result.data
          : []
      );

    } catch (error) {

      console.error(error);

    }

  }


  async function loadCashBook() {

    try {

      const query =
        new URLSearchParams();


      query.set(
        "fromDate",
        fromDate
      );


      query.set(
        "toDate",
        toDate
      );


      query.set(
        "branchCode",
        branchCode
      );


      const res =
        await fetch(
          `/api/cashbook?${query.toString()}`
        );


      const result =
        await res.json();


      setData(
        Array.isArray(result.data)
          ? result.data
          : []
      );


      /*
       * Load balance
       */

      const balanceRes =
        await fetch(
          `/api/cashbook/balance?${query.toString()}`
        );


      const balanceResult =
        await balanceRes.json();


      if (
        balanceResult.success
      ) {

        setTotalDR(
          Number(
            balanceResult.data.TotalDR
          )
        );

        setTotalCR(
          Number(
            balanceResult.data.TotalCR
          )
        );

        setBalance(
          Number(
            balanceResult.data.Balance
          )
        );

      }

    } catch (error) {

      console.error(error);

      setData([]);

    }

  }


  function filterToday() {

    const today =
      new Date()
        .toISOString()
        .substring(0, 10);


    setFromDate(today);

    setToDate(today);

  }


  function handleFormChange(
    e: React.ChangeEvent<
      HTMLInputElement
    >
  ) {

    setForm({

      ...form,

      [e.target.name]:
        e.target.value,

    });

  }


  async function saveTransaction(
    e: React.FormEvent
  ) {

    e.preventDefault();


    const dr =
      Number(form.DR || 0);

    const cr =
      Number(form.CR || 0);


    if (
      dr <= 0 &&
      cr <= 0
    ) {

      alert(
        "Enter DR or CR amount."
      );

      return;
    }


    if (
      dr > 0 &&
      cr > 0
    ) {

      alert(
        "Enter either DR or CR, not both."
      );

      return;
    }


    if (
      !form.Description.trim()
    ) {

      alert(
        "Enter description."
      );

      return;
    }


    setSaving(true);


    try {

      const res =
        await fetch(
          "/api/cashbook",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(form),

          }
        );


      const result =
        await res.json();


      if (!res.ok) {

        alert(
          result.message ||
          "Failed to save transaction"
        );

        return;
      }


      alert(
        "Cashbook transaction saved."
      );


      setForm({

        Date: today,

        RefNo: "",

        Description: "",

        DR: "",

        CR: "",

      });


      await loadCashBook();

    } catch (error) {

      console.error(error);

      alert(
        "Failed to save transaction."
      );

    } finally {

      setSaving(false);

    }

  }


  async function closeCashier() {

    if (
      !confirm(
        `Close cashier for ${fromDate}?`
      )
    ) {
      return;
    }


    try {

      const res =
        await fetch(
          "/api/cashbook/close-day",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                Date: fromDate,
              }),

          }
        );


      const result =
        await res.json();


      if (!res.ok) {

        alert(
          result.message ||
          "Failed to close cashier"
        );

        return;
      }


      alert(
        "Cashier closed successfully."
      );


      await loadCashBook();

    } catch (error) {

      console.error(error);

      alert(
        "Failed to close cashier."
      );

    }

  }


  return (

    <div className="p-4 md:p-6">

      {/* HEADER */}

      <div className="
        mb-5
        flex
        flex-col
        gap-3
        md:flex-row
        md:items-center
        md:justify-between
      ">

        <div>

          <h1 className="
            text-2xl
            font-bold
          ">
            Cash Book
          </h1>

          <p className="
            mt-1
            text-sm
            text-gray-500
          ">
            Cash transactions and
            cashier management
          </p>

        </div>


        <button
          type="button"
          onClick={closeCashier}
          className="
            rounded
            bg-red-600
            px-5
            py-2
            text-white
            hover:bg-red-700
          "
        >
          Close Cashier
        </button>

      </div>


      {/* ENTRY FORM */}

      <form
        onSubmit={saveTransaction}
        className="
          rounded-lg
          border
          bg-white
          p-5
          shadow
        "
      >

        <div className="
          grid
          grid-cols-1
          gap-4
          md:grid-cols-2
          lg:grid-cols-5
        ">


          {/* DATE */}

          <div>

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              Date
            </label>

            <input
              type="date"
              name="Date"
              value={form.Date}
              onChange={
                handleFormChange
              }
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
            />

          </div>


          {/* REF NO */}

          <div>

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              Ref No
            </label>

            <input
              name="RefNo"
              value={form.RefNo}
              onChange={
                handleFormChange
              }
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
              placeholder="Reference"
            />

          </div>


          {/* DESCRIPTION */}

          <div className="md:col-span-2">

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              Description *
            </label>

            <input
              name="Description"
              value={
                form.Description
              }
              onChange={
                handleFormChange
              }
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
              placeholder="Description"
            />

          </div>


          {/* DR */}

          <div>

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              DR
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              name="DR"
              value={form.DR}
              onChange={
                handleFormChange
              }
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
              placeholder="0.00"
            />

          </div>


          {/* CR */}

          <div>

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              CR
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              name="CR"
              value={form.CR}
              onChange={
                handleFormChange
              }
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
              placeholder="0.00"
            />

          </div>

        </div>


        <div className="
          mt-5
          flex
          flex-wrap
          gap-3
        ">

          <button
            type="submit"
            disabled={saving}
            className="
              rounded
              bg-green-600
              px-6
              py-2
              text-white
              hover:bg-green-700
              disabled:opacity-50
            "
          >
            {saving
              ? "Saving..."
              : "Save"}
          </button>

        </div>

      </form>


      {/* FILTER */}

      <div className="
        mt-6
        rounded-lg
        border
        bg-white
        p-5
        shadow
      ">

        <div className="
          grid
          grid-cols-1
          gap-4
          md:grid-cols-2
          lg:grid-cols-5
          lg:items-end
        ">


          {/* FROM DATE */}

          <div>

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
            />

          </div>


          {/* TO DATE */}

          <div>

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
            />

          </div>


          {/* BRANCH */}

          <div>

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              Branch
            </label>

            <select
              value={branchCode}
              onChange={(e) =>
                setBranchCode(
                  e.target.value
                )
              }
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
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


          {/* FILTER BUTTON */}

          <button
            type="button"
            onClick={
              loadCashBook
            }
            className="
              rounded
              bg-blue-600
              px-5
              py-2
              text-white
              hover:bg-blue-700
            "
          >
            Filter
          </button>


          {/* TODAY BUTTON */}

          <button
            type="button"
            onClick={
              filterToday
            }
            className="
              rounded
              bg-gray-600
              px-5
              py-2
              text-white
              hover:bg-gray-700
            "
          >
            Today
          </button>

        </div>

      </div>


      {/* BALANCE CARDS */}

      <div className="
        mt-6
        grid
        grid-cols-1
        gap-4
        md:grid-cols-3
      ">

        <div className="
          rounded-lg
          border
          bg-white
          p-5
          shadow
        ">

          <div className="
            text-sm
            text-gray-500
          ">
            Total DR
          </div>

          <div className="
            mt-1
            text-2xl
            font-bold
          ">
            {totalDR.toLocaleString(
              "en-LK",
              {
                minimumFractionDigits: 2,
              }
            )}
          </div>

        </div>


        <div className="
          rounded-lg
          border
          bg-white
          p-5
          shadow
        ">

          <div className="
            text-sm
            text-gray-500
          ">
            Total CR
          </div>

          <div className="
            mt-1
            text-2xl
            font-bold
          ">
            {totalCR.toLocaleString(
              "en-LK",
              {
                minimumFractionDigits: 2,
              }
            )}
          </div>

        </div>


        <div className="
          rounded-lg
          border
          bg-white
          p-5
          shadow
        ">

          <div className="
            text-sm
            text-gray-500
          ">
            Cashbook Balance
          </div>

          <div className="
            mt-1
            text-2xl
            font-bold
          ">
            {balance.toLocaleString(
              "en-LK",
              {
                minimumFractionDigits: 2,
              }
            )}
          </div>

        </div>

      </div>


      {/* TABLE */}

      <div className="
        mt-6
        overflow-x-auto
        rounded-lg
        border
        bg-white
        shadow
      ">

        <table className="
          min-w-[1200px]
          w-full
          text-sm
        ">

          <thead className="
            bg-gray-100
          ">

            <tr>

              <th className="
                p-3
                text-left
              ">
                GCB No
              </th>

              <th className="
                p-3
                text-left
              ">
                Branch CB No
              </th>

              <th className="
                p-3
                text-left
              ">
                Date
              </th>

              <th className="
                p-3
                text-left
              ">
                Ref No
              </th>

              <th className="
                p-3
                text-left
              ">
                Description
              </th>

              <th className="
                p-3
                text-right
              ">
                DR
              </th>

              <th className="
                p-3
                text-right
              ">
                CR
              </th>

              <th className="
                p-3
                text-left
              ">
                Branch
              </th>

              <th className="
                p-3
                text-left
              ">
                Employee
              </th>

            </tr>

          </thead>


          <tbody>

            {data.length === 0 ? (

              <tr>

                <td
                  colSpan={9}
                  className="
                    p-8
                    text-center
                    text-gray-500
                  "
                >
                  No cashbook transactions
                </td>

              </tr>

            ) : (

              data.map(
                item => (

                  <tr
                    key={item.GCBNo}
                    className="
                      border-t
                      hover:bg-gray-50
                    "
                  >

                    <td className="
                      p-3
                      font-medium
                    ">
                      {item.GCBNo}
                    </td>

                    <td className="p-3">
                      {item.BranchCBNo}
                    </td>

                    <td className="p-3">
                      {item.Date?.substring(
                        0,
                        10
                      )}
                    </td>

                    <td className="p-3">
                      {item.RefNo}
                    </td>

                    <td className="p-3">
                      {item.Description}
                    </td>

                    <td className="
                      p-3
                      text-right
                    ">
                      {Number(
                        item.DR
                      ).toLocaleString(
                        "en-LK",
                        {
                          minimumFractionDigits:
                            2,
                        }
                      )}
                    </td>

                    <td className="
                      p-3
                      text-right
                    ">
                      {Number(
                        item.CR
                      ).toLocaleString(
                        "en-LK",
                        {
                          minimumFractionDigits:
                            2,
                        }
                      )}
                    </td>

                    <td className="p-3">
                      {item.BranchName}
                    </td>

                    <td className="p-3">
                      {item.EmpName}
                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}