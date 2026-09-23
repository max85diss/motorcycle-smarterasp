
"use client";

import { useEffect, useState } from "react";


interface BankAccount {

  AccountNo: string;

  Date: string;

  BankName: string;

  Branch: string;

  Manager: string;

  Address: string;

  TP: string;

  Mobile: string;

  AccountType: string;

  State: string;

}


const emptyForm = {

  AccountNo: "",

  Date: new Date()
    .toISOString()
    .substring(0, 10),

  BankName: "",

  Branch: "",

  Manager: "",

  Address: "",

  TP: "",

  Mobile: "",

  AccountType: "Current",

  State: "Active",

};


export default function BankAccountsPage() {

  const [
    accounts,
    setAccounts,
  ] = useState<BankAccount[]>([]);


  const [
    form,
    setForm,
  ] = useState(emptyForm);


  const [
    editing,
    setEditing,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(false);


  useEffect(() => {

    loadAccounts();

  }, []);


  async function loadAccounts() {

    try {

      const response =
        await fetch(
          "/api/bank-accounts"
        );

      const data =
        await response.json();


      setAccounts(
        Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : []
      );

    } catch (error) {

      console.error(error);

      setAccounts([]);

    }

  }


  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) {

    const {
      name,
      value,
    } = e.target;


    setForm(
      previous => ({
        ...previous,
        [name]: value,
      })
    );

  }


  function loadAccount(
    account: BankAccount
  ) {

    setEditing(true);

    setForm({

      AccountNo:
        account.AccountNo,

      Date:
        account.Date
          ?.substring(0, 10),

      BankName:
        account.BankName ?? "",

      Branch:
        account.Branch ?? "",

      Manager:
        account.Manager ?? "",

      Address:
        account.Address ?? "",

      TP:
        account.TP ?? "",

      Mobile:
        account.Mobile ?? "",

      AccountType:
        account.AccountType ?? "Current",

      State:
        account.State ?? "Active",

    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }


  async function saveAccount(
    e: React.FormEvent
  ) {

    e.preventDefault();


    if (!form.AccountNo.trim()) {

      alert(
        "Please enter Account No."
      );

      return;
    }


    if (!form.BankName.trim()) {

      alert(
        "Please enter Bank Name."
      );

      return;
    }


    setLoading(true);


    try {

      const url = editing

        ? `/api/bank-accounts/${encodeURIComponent(
            form.AccountNo
          )}`

        : "/api/bank-accounts";


      const response =
        await fetch(
          url,
          {

            method:
              editing
                ? "PUT"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(form),

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Failed to save account"
        );

        return;
      }


      alert(
        editing
          ? "Bank account updated successfully."
          : "Bank account saved successfully."
      );


      clearForm();

      await loadAccounts();

    } catch (error) {

      console.error(error);

      alert(
        "An unexpected error occurred."
      );

    } finally {

      setLoading(false);

    }

  }


  async function deleteAccount(
    accountNo: string
  ) {

    const confirmDelete =
      window.confirm(
        `Delete bank account ${accountNo}?`
      );


    if (!confirmDelete) {
      return;
    }


    try {

      const response =
        await fetch(
          `/api/bank-accounts/${encodeURIComponent(
            accountNo
          )}`,
          {
            method: "DELETE",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Failed to delete account"
        );

        return;
      }


      alert(
        "Bank account deleted successfully."
      );


      if (
        form.AccountNo === accountNo
      ) {
        clearForm();
      }


      await loadAccounts();

    } catch (error) {

      console.error(error);

      alert(
        "Failed to delete account."
      );

    }

  }


  function clearForm() {

    setEditing(false);

    setForm({

      ...emptyForm,

      Date:
        new Date()
          .toISOString()
          .substring(0, 10),

    });

  }


  return (

    <div className="p-4 md:p-6">

      {/* HEADER */}

      <div className="
        mb-6
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
            Bank Accounts
          </h1>

          <p className="
            text-sm
            text-gray-500
            mt-1
          ">
            Manage company bank accounts
          </p>

        </div>


        {editing && (

          <button
            type="button"
            onClick={clearForm}
            className="
              rounded
              bg-gray-500
              px-5
              py-2
              text-white
              hover:bg-gray-600
            "
          >
            New Account
          </button>

        )}

      </div>


      {/* FORM */}

      <form
        onSubmit={saveAccount}
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
          lg:grid-cols-3
        ">


          {/* ACCOUNT NO */}

          <div>

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              Account No *
            </label>

            <input
              name="AccountNo"
              value={form.AccountNo}
              onChange={handleChange}
              disabled={editing}
              className="
                w-full
                rounded
                border
                px-3
                py-2
                disabled:bg-gray-100
              "
              placeholder="Enter account number"
            />

          </div>


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
              onChange={handleChange}
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
            />

          </div>


          {/* BANK NAME */}

          <div>

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              Bank Name *
            </label>

            <input
              name="BankName"
              value={form.BankName}
              onChange={handleChange}
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
              placeholder="Bank name"
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

            <input
              name="Branch"
              value={form.Branch}
              onChange={handleChange}
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
              placeholder="Branch"
            />

          </div>


          {/* MANAGER */}

          <div>

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              Manager
            </label>

            <input
              name="Manager"
              value={form.Manager}
              onChange={handleChange}
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
              placeholder="Manager"
            />

          </div>


          {/* TP */}

          <div>

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              Telephone
            </label>

            <input
              name="TP"
              value={form.TP}
              onChange={handleChange}
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
              placeholder="Telephone"
            />

          </div>


          {/* MOBILE */}

          <div>

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              Mobile
            </label>

            <input
              name="Mobile"
              value={form.Mobile}
              onChange={handleChange}
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
              placeholder="Mobile"
            />

          </div>


          {/* ACCOUNT TYPE */}

          <div>

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              Account Type
            </label>

            <select
              name="AccountType"
              value={form.AccountType}
              onChange={handleChange}
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
            >

              <option value="Current">
                Current
              </option>

              <option value="Savings">
                Savings
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* STATE */}

          <div>

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              State
            </label>

            <select
              name="State"
              value={form.State}
              onChange={handleChange}
              className="
                w-full
                rounded
                border
                px-3
                py-2
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


          {/* ADDRESS */}

          <div className="
            md:col-span-2
            lg:col-span-3
          ">

            <label className="
              mb-1
              block
              text-sm
              font-medium
            ">
              Address
            </label>

            <textarea
              name="Address"
              value={form.Address}
              onChange={handleChange}
              rows={2}
              className="
                w-full
                rounded
                border
                px-3
                py-2
              "
              placeholder="Bank branch address"
            />

          </div>

        </div>


        {/* BUTTONS */}

        <div className="
          mt-5
          flex
          flex-wrap
          gap-3
        ">

          <button
            type="submit"
            disabled={loading}
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

            {loading
              ? "Saving..."
              : editing
                ? "Update"
                : "Save"}

          </button>


          <button
            type="button"
            onClick={clearForm}
            className="
              rounded
              bg-gray-500
              px-6
              py-2
              text-white
              hover:bg-gray-600
            "
          >
            Clear
          </button>

        </div>

      </form>


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

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">
                Account No
              </th>

              <th className="p-3 text-left">
                Date
              </th>

              <th className="p-3 text-left">
                Bank
              </th>

              <th className="p-3 text-left">
                Branch
              </th>

              <th className="p-3 text-left">
                Manager
              </th>

              <th className="p-3 text-left">
                TP
              </th>

              <th className="p-3 text-left">
                Mobile
              </th>

              <th className="p-3 text-left">
                Account Type
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

            {accounts.length === 0 ? (

              <tr>

                <td
                  colSpan={10}
                  className="
                    p-6
                    text-center
                    text-gray-500
                  "
                >
                  No bank accounts found
                </td>

              </tr>

            ) : (

              accounts.map(
                account => (

                  <tr
                    key={account.AccountNo}
                    className="
                      border-t
                      hover:bg-gray-50
                    "
                  >

                    <td className="p-3 font-medium">
                      {account.AccountNo}
                    </td>

                    <td className="p-3">
                      {account.Date?.substring(
                        0,
                        10
                      )}
                    </td>

                    <td className="p-3">
                      {account.BankName}
                    </td>

                    <td className="p-3">
                      {account.Branch}
                    </td>

                    <td className="p-3">
                      {account.Manager}
                    </td>

                    <td className="p-3">
                      {account.TP}
                    </td>

                    <td className="p-3">
                      {account.Mobile}
                    </td>

                    <td className="p-3">
                      {account.AccountType}
                    </td>

                    <td className="p-3">

                      <span className="
                        rounded
                        bg-gray-100
                        px-2
                        py-1
                      ">
                        {account.State}
                      </span>

                    </td>

                    <td className="p-3">

                      <div className="
                        flex
                        justify-center
                        gap-2
                      ">

                        <button
                          type="button"
                          onClick={() =>
                            loadAccount(
                              account
                            )
                          }
                          className="
                            rounded
                            bg-blue-600
                            px-3
                            py-1
                            text-white
                            hover:bg-blue-700
                          "
                        >
                          Edit
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            deleteAccount(
                              account.AccountNo
                            )
                          }
                          className="
                            rounded
                            bg-red-600
                            px-3
                            py-1
                            text-white
                            hover:bg-red-700
                          "
                        >
                          Delete
                        </button>

                      </div>

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