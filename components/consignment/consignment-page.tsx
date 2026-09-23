
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";


interface BikeModel {
  PartNo: string;
  Type: string;
  Model: string;
  Color: string;
  Price: number;
  Description: string;
  Status: string;
}


interface Consignment {
  ID: number;
  SysNo: string;
  Date: string;
  ConNO: string;
  NoOfItems: number;
  Status: string;
  APED: string;
  BranchCode: string;
  BranchName: string;
  EmpCode: string;
  EmpName: string;
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
  ConsignmentNo: string;
  BranchCode: string;
  BranchName: string;
  EmpCode: string;
  EmpName: string;
}

const emptyConsignment: Consignment = {
  ID: 0,
  SysNo: "",
  Date: new Date().toISOString().split("T")[0],
  ConNO: "",
  NoOfItems: 0,
  Status: "Active",
  APED: "Entering",
  BranchCode: "",
  BranchName: "",
  EmpCode: "",
  EmpName: "",
};

const emptyItem: ConsignmentItem = {
  No: 0,
  SysRefNo: "",
  SerialNo: "",
  PartNo: "",
  ENO: "",
  FNO: "",
  Remark: "",
  Status: "Active",
  ReportNo: "",
  ConsignmentNo: "",
  BranchCode: "",
  BranchName: "",
  EmpCode: "",
  EmpName: "",
};

export default function ConsignmentPage() {

  const [activeTab, setActiveTab] =
    useState<"consignment" | "items">(
      "consignment"
    );

  const [form, setForm] =
    useState<Consignment>(
      emptyConsignment
    );

  const [itemForm, setItemForm] =
    useState<ConsignmentItem>(
      emptyItem
    );

  const [consignments, setConsignments] =
    useState<Consignment[]>([]);

  const [items, setItems] =
    useState<ConsignmentItem[]>([]);

  const [isEdit, setIsEdit] =
    useState(false);

  const [isItemEdit, setIsItemEdit] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [itemSearch, setItemSearch] =
    useState("");


  const [models, setModels] = useState<BikeModel[]>([]);

  const [selected, setSelected] =
    useState<Consignment | null>(null);
  
  // =========================================
  // LOAD CONSIGNMENTS
  // =========================================

  async function loadConsignments() {

    try {

      const response =
        await fetch("/api/consignment");

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message
        );
      }

      setConsignments(
        data.data || []
      );

    } catch (error) {

      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to load consignments."
      );

    }

  }

  //loading bike models
   const [model, setModdel] = useState({
    PartNo: "",
    Model: "",
    Type: "",
    Color: "",
    Price: "",
    Description: "",
  });

  async function loadModels() {
    try {
      const res = await fetch("/api/setting/bike");
      console.log(res)
      if (!res.ok) {
        throw new Error("Failed to load models");
      }

      const data= await res.json();
      console.log(data.data)
      // setModels(Array.isArray(data) ? data : []);
      setModels(data.data);
    } catch (error) {
      console.error(error);
    }
  }

    //model change function

    function handleModelChange( e: React.ChangeEvent<HTMLSelectElement>){
      const partNo = e.target.value;
      console.log(partNo);
      setItemForm({
        ...itemForm,
        PartNo:partNo
      }

      )
     }


  // =========================================
  // LOAD ITEMS
  // =========================================

  async function loadItems(
    sysNo: string
  ) {

    if (!sysNo) {
      setItems([]);
      return;
    }

    try {

      const response =
        await fetch(
          `/api/consignment/items?consignmentNo=${encodeURIComponent(
            sysNo
          )}`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message
        );
      }

      setItems(
        data.data || []
      );

    } catch (error) {

      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to load items."
      );

    }

  }

  //get current user and set branch and emp code in form
  async function loadUserFromCookies() {
  try {
    const response = await fetch("/api/auth/me");

    const data = await response.json();
    console.log("User data from /api/auth/me:", data);
    console.log("User from cookies:", data.user);
    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to load user"
      );
    }

    const user = data.user;
    console.log("User from cookies:", user);
    setForm(prev => ({
      ...prev,

      BranchCode: user.branchCode,
      BranchName: user.location,

      EmpCode: user.empCode,
      EmpName: user.username,
    }));

    setItemForm(prev => ({  
      ...prev,
      BranchCode: user.branchCode,
      BranchName: user.location,
      EmpCode: user.empCode,
      EmpName: user.username,
    }));

    


  } catch (error) {
    console.error(
      "Error loading user from cookies:",
      error
    );
  }
}
  

  useEffect(() => {

    loadConsignments();
    loadUserFromCookies();
    loadModels() ;
  }, []);


  // =========================================
  // HEADER FORM CHANGE
  // =========================================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement
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


  // =========================================
  // ITEM FORM CHANGE
  // =========================================

  function handleItemChange(
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

    setItemForm(prev => ({
      ...prev,
      [name]: value,
    }));

  }


  // =========================================
  // SAVE CONSIGNMENT
  // =========================================

  async function saveConsignment() {

    if (!form.Date) {

      alert("Date is required.");

      return;

    }

    if (!form.ConNO.trim()) {

      alert("Consignment No is required.");

      return;

    }

    try {
      await loadUserFromCookies();

      setLoading(true);

      const url = isEdit
        ? `/api/consignment/${encodeURIComponent(
            form.SysNo
          )}`
        : "/api/consignment";

      const response =
        await fetch(url, {

          method: isEdit
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            Date: form.Date,
            ConNO: form.ConNO,
            Status: form.Status,
            APED: form.APED,
            BranchCode: form.BranchCode,
            BranchName: form.BranchName,
            EmpCode: form.EmpCode,
            EmpName: form.EmpName,
          }),

        });


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message
        );

      }


      alert(data.message);

      if (!isEdit && data.data?.SysNo) {

        const newSysNo =
          data.data.SysNo;

        setForm(prev => ({
          ...prev,
          SysNo: newSysNo,
        }));

        setActiveTab("items");

        await loadItems(
          newSysNo
        );

      }


      await loadConsignments();

      if (isEdit) {

        await loadItems(
          form.SysNo
        );

      }


      setIsEdit(true);

    } catch (error) {

      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to save consignment."
      );

    } finally {

      setLoading(false);

    }

  }



  // =========================================
  // EDIT CONSIGNMENT
  // =========================================

  async function editConsignment(
    item: Consignment
  ) {

    setForm({
      ...item,
      Date: item.Date
        ? item.Date
            .toString()
            .split("T")[0]
        : "",

    });
    setSelected(item)
    setIsEdit(true);

    await loadItems(
      item.SysNo
    );
    await loadUserFromCookies();
    console.log("Editing consignment:", item);

    setActiveTab("consignment");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }


  // =========================================
  // NEW CONSIGNMENT
  // =========================================

  function newConsignment() {

    setForm(
      emptyConsignment
    );

    setItems([]);

    setIsEdit(false);

    setIsItemEdit(false);

    setItemForm(
      emptyItem
    );

    setActiveTab(
      "consignment"
    );

  }

  //send to approval

  async function sendToApproval() {
    console.log(selected)
  if (!selected) {
    alert("Please select a consignment.");
    return;
  }

  if (selected.APED !== "Entering") {
    alert(
      "Only an Entering consignment can be sent for approval."
    );
    return;
  }

  const confirmed = window.confirm(
    `Send ${selected.SysNo} to approval?`
  );

  if (!confirmed) {
    return;
  }

  try {

    const response = await fetch(
      "/api/consignment/send-approval",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          SysNo: selected.SysNo,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(
        data.message ||
        "Unable to send consignment for approval."
      );
      return;
    }

    alert(data.message);

    // Reload consignment list
    await loadConsignments();

    // Reload selected consignment
    const selectedResponse =
      await fetch(
        `/api/consignment/${encodeURIComponent(
          selected.SysNo
        )}`
      );

    const selectedData =
      await selectedResponse.json();

    if (selectedResponse.ok) {
      setSelected(selectedData);
    }

  } catch (error) {

    console.error(error);

    alert(
      "An error occurred while sending for approval."
    );
  }
}


  // =========================================
  // SAVE ITEM
  // =========================================

  async function saveItem() {
     await loadUserFromCookies();
     console.log("Item form before save:", itemForm);
    if (!form.SysNo) {

      alert(
        "Please save the consignment first."
      );

      setActiveTab(
        "consignment"
      );

      return;

    }


    if (form.APED !== "Entering") {

      alert(
        "Items cannot be changed after approval processing has started."
      );

      return;

    }


    if (!itemForm.PartNo.trim()) {

      alert("Part No is required.");

      return;

    }


    if (!itemForm.SerialNo.trim()) {

      alert("Serial No is required.");

      return;

    }


    try {
     
      setLoading(true);


      const url = isItemEdit

        ? `/api/consignment/items/${encodeURIComponent(
            itemForm.SysRefNo
          )}`

        : "/api/consignment/items";


      const response =
        await fetch(url, {

          method: isItemEdit
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            SysRefNo:
              itemForm.SysRefNo,

            SerialNo:
              itemForm.SerialNo,

            PartNo:
              itemForm.PartNo,

            ENO:
              itemForm.ENO,

            FNO:
              itemForm.FNO,

            Remark:
              itemForm.Remark,

            Status:
              itemForm.Status,

            ReportNo:
              itemForm.ReportNo,

            ConsignmentNo:
              form.SysNo,

            BranchCode:
              itemForm.BranchCode,

            BranchName:
              itemForm.BranchName,

            EmpCode:
              itemForm.EmpCode,

            EmpName:
              itemForm.EmpName

          }),

        });


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message
        );

      }


      alert(data.message);


      clearItemForm();
      await loadUserFromCookies();

      await loadItems(
        form.SysNo
      );

      await loadConsignments();

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


  // =========================================
  // EDIT ITEM
  // =========================================

  function editItem(
    item: ConsignmentItem
  ) {

    if (form.APED !== "Entering") {

      alert(
        "This consignment is not in Entering state."
      );

      return;

    }


    setItemForm({
      ...item,
    });
    

    setIsItemEdit(true);

  }


  // =========================================
  // CLEAR ITEM
  // =========================================

  function clearItemForm() {

    setItemForm({
      ...emptyItem,
      ConsignmentNo:
        form.SysNo,
    });

    setIsItemEdit(false);
    
  }

  // send to approval



  // =========================================
  // FILTER CONSIGNMENTS
  // =========================================

  const filteredConsignments =
    consignments.filter(
      item => {

        const text =
          search.toLowerCase();

        return (
          item.SysNo
            ?.toLowerCase()
            .includes(text) ||

          item.ConNO
            ?.toLowerCase()
            .includes(text) ||

          item.BranchName
            ?.toLowerCase()
            .includes(text) ||

          item.EmpName
            ?.toLowerCase()
            .includes(text)
        );

      }
    );


  // =========================================
  // FILTER ITEMS
  // =========================================

  const filteredItems =
    items.filter(
      item => {

        const text =
          itemSearch.toLowerCase();

        return (
          item.SysRefNo
            ?.toLowerCase()
            .includes(text) ||

          item.SerialNo
            ?.toLowerCase()
            .includes(text) ||

          item.PartNo
            ?.toLowerCase()
            .includes(text) ||

          item.ENO
            ?.toLowerCase()
            .includes(text) ||

          item.FNO
            ?.toLowerCase()
            .includes(text)
        );

      }
    );


  return (

    <div className="
      min-h-screen
      bg-slate-100
      p-4
      md:p-6
    ">


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
            text-slate-800
            md:text-3xl
          ">
            Consignment
          </h1>

          <p className="
            mt-1
            text-sm
            text-slate-500
          ">
            Manage consignment headers and items.
          </p>

        </div>


        <button
          onClick={newConsignment}
          className="
            rounded-lg
            bg-blue-600
            px-5
            py-2.5
            font-medium
            text-white
            hover:bg-blue-700
          "
        >
          + New Consignment
        </button>

      </div>



      {/* TABS */}

      <div className="
        mb-5
        flex
        overflow-x-auto
        rounded-xl
        bg-white
        p-1
        shadow-sm
      ">

        <button
          onClick={() =>
            setActiveTab(
              "consignment"
            )
          }
          className={`
            whitespace-nowrap
            rounded-lg
            px-5
            py-2.5
            text-sm
            font-medium

            ${
              activeTab ===
              "consignment"

                ? "bg-blue-600 text-white"

                : "text-slate-600 hover:bg-slate-100"
            }
          `}
        >
          Consignment
        </button>


        <button
          onClick={() =>
            setActiveTab("items")
          }
          disabled={!form.SysNo}
          className={`
            whitespace-nowrap
            rounded-lg
            px-5
            py-2.5
            text-sm
            font-medium

            ${
              activeTab === "items"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }

            disabled:cursor-not-allowed
            disabled:opacity-40
          `}
        >
          Consignment Items
        </button>

      </div>



      {/* ===================================== */}
      {/* CONSIGNMENT TAB */}
      {/* ===================================== */}

      {activeTab === "consignment" && (

        <>

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
                  ? "Edit Consignment"
                  : "New Consignment"}
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
                lg:grid-cols-4
              ">


                {/* SYS NO */}

                <div>

                  <label className="
                    mb-1
                    block
                    text-sm
                    font-medium
                  ">
                    System No
                  </label>

                  <input
                    value={
                      form.SysNo ||
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
                      rounded-lg
                      border
                      px-3
                      py-2.5
                    "
                  />

                </div>



                {/* CON NO */}

                <div>

                  <label className="
                    mb-1
                    block
                    text-sm
                    font-medium
                  ">
                    Consignment No
                  </label>

                  <input
                    name="ConNO"
                    value={form.ConNO}
                    onChange={handleChange}
                    placeholder="Enter consignment no"
                    className="
                      w-full
                      rounded-lg
                      border
                      px-3
                      py-2.5
                    "
                  />

                </div>



                {/* NO OF ITEMS */}

                <div>

                  <label className="
                    mb-1
                    block
                    text-sm
                    font-medium
                  ">
                    No. Of Items
                  </label>

                  <input
                    value={
                      form.NoOfItems
                    }
                    readOnly
                    className="
                      w-full
                      rounded-lg
                      border
                      bg-slate-100
                      px-3
                      py-2.5
                    "
                  />

                </div>



                {/* APED */}

                <div>

                  <label className="
                    mb-1
                    block
                    text-sm
                    font-medium
                  ">
                    Approval Status
                  </label>

                  <select
                    name="APED"
                    value={form.APED}
                    onChange={handleChange}
                    disabled={
                      isEdit &&
                      form.APED !== "Entering"
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      px-3
                      py-2.5
                    "
                  >

                    <option value="Entering">
                      Entering
                    </option>

                    <option value="AP">
                      AP
                    </option>

                    <option value="APED">
                      APED
                    </option>

                  </select>

                </div>



                {/* STATUS */}

                <div>

                  <label className="
                    mb-1
                    block
                    text-sm
                    font-medium
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
                    value={
                      form.BranchName ||
                      "From Cookie"
                    }
                    readOnly
                    className="
                      w-full
                      rounded-lg
                      border
                      bg-slate-100
                      px-3
                      py-2.5
                    "
                  />

                </div>



                {/* EMPLOYEE */}

                <div>

                  <label className="
                    mb-1
                    block
                    text-sm
                    font-medium
                  ">
                    Employee
                  </label>

                  <input
                    value={
                      form.EmpName ||
                      "From Cookie"
                    }
                    readOnly
                    className="
                      w-full
                      rounded-lg
                      border
                      bg-slate-100
                      px-3
                      py-2.5
                    "
                  />

                </div>

              </div>



              {/* BUTTONS */}

              <div className="
                mt-6
                flex
                gap-3
              ">

                <button
                  onClick={
                    saveConsignment
                  }
                  disabled={loading}
                  className="
                    rounded-lg
                    bg-blue-600
                    px-6
                    py-2.5
                    font-medium
                    text-white
                    hover:bg-blue-700
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
                  onClick={
                    newConsignment
                  }
                  className="
                    rounded-lg
                    bg-slate-500
                    px-6
                    py-2.5
                    font-medium
                    text-white
                  "
                >
                  Clear
                </button>

                  <button
                    onClick={
                      sendToApproval
                    }
                    className="
                      rounded-lg
                      bg-slate-500
                      px-6
                      py-2.5
                      font-medium
                      text-white
                    "
                  >
                    Send To Approval
                  </button>
                

              </div>

            </div>

          </div>



          {/* CONSIGNMENT LIST */}

          <div className="
            mt-8
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-sm
          ">

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
                ">
                  Consignment List
                </h2>

              </div>


              <input
                value={search}
                onChange={
                  e =>
                    setSearch(
                      e.target.value
                    )
                }
                placeholder="Search..."
                className="
                  w-full
                  rounded-lg
                  border
                  px-4
                  py-2.5
                  md:w-80
                "
              />

            </div>


            <div className="overflow-x-auto">

              <table className="
                min-w-[1100px]
                w-full
              ">

                <thead>

                  <tr className="
                    bg-slate-50
                  ">

                    <th className="p-3 text-left">
                      Action
                    </th>

                    <th className="p-3 text-left">
                      Sys No
                    </th>

                    <th className="p-3 text-left">
                      Date
                    </th>

                    <th className="p-3 text-left">
                      Con No
                    </th>

                    <th className="p-3 text-center">
                      Items
                    </th>

                    <th className="p-3 text-left">
                      APED
                    </th>

                    <th className="p-3 text-left">
                      Status
                    </th>

                    <th className="p-3 text-left">
                      Branch
                    </th>

                    <th className="p-3 text-left">
                      Employee
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredConsignments.map(
                    item => (

                      <tr
                        key={item.SysNo}
                        className="
                          border-b
                          hover:bg-slate-50
                        "
                      >

                        <td className="p-3">

                          <button
                            onClick={() =>
                              editConsignment(
                                item
                              )
                            }
                            className="
                              rounded-lg
                              bg-indigo-600
                              px-4
                              py-1.5
                              text-sm
                              text-white
                            "
                          >
                            Edit
                          </button>

                        </td>

                        <td className="
                          p-3
                          font-semibold
                        ">
                          {item.SysNo}
                        </td>

                        <td className="p-3">
                          {item.Date
                            ?.toString()
                            .split("T")[0]}
                        </td>

                        <td className="p-3">
                          {item.ConNO}
                        </td>

                        <td className="
                          p-3
                          text-center
                        ">
                          {item.NoOfItems}
                        </td>

                        <td className="p-3">

                          <span className="
                            rounded-full
                            bg-blue-100
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            text-blue-700
                          ">
                            {item.APED}
                          </span>

                        </td>

                        <td className="p-3">
                          {item.Status}
                        </td>

                        <td className="p-3">
                          {item.BranchName}
                        </td>

                        <td className="p-3">
                          {item.EmpName}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </>

      )}



      {/* ===================================== */}
      {/* ITEMS TAB */}
      {/* ===================================== */}

      {activeTab === "items" && (

        <>

          <div className="
            mb-5
            flex
            flex-col
            gap-3
            rounded-xl
            bg-white
            p-4
            shadow-sm
            md:flex-row
            md:items-center
            md:justify-between
          ">

            <div>

              <span className="
                text-sm
                text-slate-500
              ">
                Consignment
              </span>

              <div className="
                text-lg
                font-bold
                text-slate-800
              ">
                {form.SysNo}
              </div>

            </div>


            <div>

              <span
  className={`
    rounded-full
    px-4
    py-2
    text-sm
    font-semibold
    ${
      form.APED === "Entering"
        ? "bg-green-100 text-green-700"
        : form.APED === "AP"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-700"
    }
  `}
>
  {form.APED}
</span>

            </div>

          </div>



          {/* ITEM FORM */}

          {form.APED === "Entering" && (

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
                  {isItemEdit
                    ? "Edit Consignment Item"
                    : "Add Consignment Item"}
                </h2>

              </div>


              <div className="p-5">

                <div className="
                  grid
                  grid-cols-1
                  gap-4
                  md:grid-cols-2
                  lg:grid-cols-4
                ">

                  <input
                    value={
                      itemForm.SysRefNo ||
                      "Auto Generated"
                    }
                    readOnly
                    placeholder="System Ref"
                    className="
                      rounded-lg
                      border
                      bg-slate-100
                      px-3
                      py-2.5
                    "
                  />

                   <select
                    name="Description"
                   
                    onChange={
                      handleModelChange
                    }
                    className="
                      rounded-lg
                      border
                      px-3
                      py-2.5
                    "
                  >

                   <option value="">
                    -- Select Bike Model --
                  </option>

            {models.map((item) => (
              <option
                key={item.PartNo}
                value={item.PartNo}
              >
                {item.Model} - {item.Color}
              </option>
                 

                   ))}
                    </select>

                    <input
                    name="PartNo"
                    value={
                      itemForm.PartNo
                    }
                    onChange={
                      handleItemChange
                    }
                    placeholder="Part No"
                    className="
                      rounded-lg
                      border
                      px-3
                      py-2.5
                    "
                  />

                  <input
                    name="SerialNo"
                    value={
                      itemForm.SerialNo
                    }
                    onChange={
                      handleItemChange
                    }
                    placeholder="Serial No"
                    className="
                      rounded-lg
                      border
                      px-3
                      py-2.5
                    "
                  />

                

                  <input
                    name="ENO"
                    value={
                      itemForm.ENO
                    }
                    onChange={
                      handleItemChange
                    }
                    placeholder="Engine No"
                    className="
                      rounded-lg
                      border
                      px-3
                      py-2.5
                    "
                  />

                  <input
                    name="FNO"
                    value={
                      itemForm.FNO
                    }
                    onChange={
                      handleItemChange
                    }
                    placeholder="Frame No"
                    className="
                      rounded-lg
                      border
                      px-3
                      py-2.5
                    "
                  />

                  <input
                    name="ReportNo"
                    value={
                      itemForm.ReportNo
                    }
                    onChange={
                      handleItemChange
                    }
                    placeholder="Report No"
                    className="
                      rounded-lg
                      border
                      px-3
                      py-2.5
                    "
                  />

                  <select
                    name="Status"
                    value={
                      itemForm.Status
                    }
                    onChange={
                      handleItemChange
                    }
                    className="
                      rounded-lg
                      border
                      px-3
                      py-2.5
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

                  <textarea
                    name="Remark"
                    value={
                      itemForm.Remark
                    }
                    onChange={
                      handleItemChange
                    }
                    placeholder="Remark"
                    rows={2}
                    className="
                      rounded-lg
                      border
                      px-3
                      py-2.5
                      lg:col-span-2
                    "
                  />

                </div>


                <div className="
                  mt-5
                  flex
                  gap-3
                ">

                  <button
                    onClick={saveItem}
                    disabled={loading}
                    className="
                      rounded-lg
                      bg-blue-600
                      px-6
                      py-2.5
                      font-medium
                      text-white
                    "
                  >
                    {isItemEdit
                      ? "Update Item"
                      : "Save Item"}
                  </button>


                  <button
                    onClick={
                      clearItemForm
                    }
                    className="
                      rounded-lg
                      bg-slate-500
                      px-6
                      py-2.5
                      font-medium
                      text-white
                    "
                  >
                    Clear
                  </button>

                    

                </div>

              </div>

            </div>

          )}



          {/* ITEMS TABLE */}

          <div className="
            mt-8
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-sm
          ">

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

              <h2 className="
                text-lg
                font-semibold
              ">
                Consignment Items
              </h2>


              <input
                value={itemSearch}
                onChange={
                  e =>
                    setItemSearch(
                      e.target.value
                    )
                }
                placeholder="Search items..."
                className="
                  w-full
                  rounded-lg
                  border
                  px-4
                  py-2.5
                  md:w-80
                "
              />

            </div>


            <div className="overflow-x-auto">

              <table className="
                min-w-[1400px]
                w-full
              ">

                <thead>

                  <tr className="
                    bg-slate-50
                  ">

                    <th className="p-3">
                      Action
                    </th>

                    <th className="p-3">
                      Sys Ref No
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
                      Remark
                    </th>

                    <th className="p-3">
                      Status
                    </th>

                    <th className="p-3">
                      Report No
                    </th>

                    <th className="p-3">
                      Consignment No
                    </th>

                    <th className="p-3">
                      Branch
                    </th>

                    <th className="p-3">
                      Employee
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredItems.map(
                    item => (

                      <tr
                        key={
                          item.SysRefNo
                        }
                        className="
                          border-b
                          hover:bg-slate-50
                        "
                      >

                        <td className="p-3">

                          <button
                            onClick={() =>
                              editItem(
                                item
                              )
                            }
                            disabled={
                              form.APED !==
                              "Entering"
                            }
                            className="
                              rounded-lg
                              bg-indigo-600
                              px-4
                              py-1.5
                              text-sm
                              text-white
                              disabled:opacity-40
                            "
                          >
                            Edit
                          </button>

                        </td>

                        <td className="
                          p-3
                          font-semibold
                        ">
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
                          {item.Remark}
                        </td>

                        <td className="p-3">
                          {item.Status}
                        </td>

                        <td className="p-3">
                          {item.ReportNo}
                        </td>

                        <td className="p-3">
                          {item.ConsignmentNo}
                        </td>

                        <td className="p-3">
                          {item.BranchName}
                        </td>

                        <td className="p-3">
                          {item.EmpName}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </>

      )}

    </div>

  );

}