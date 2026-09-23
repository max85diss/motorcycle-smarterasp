"use client"
import {  useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Branch {
  BranchCode: string;
  BranchName: string;
  Location: string;
  AddressL1: string;
  AddressL2: string;
  AddressL3: string;
  Manager: string;
  TP: string;
  Mobile: string;
  Status: string;
  Note: string;
  StartDate: string;
  Id : number;
  IsMainBranch?: boolean; // Optional property to indicate if it's the main branch
}


const status = [
  "Active",
  "Deactive",
  "Deleted",
  "Hold"
];


export default  function NewBranchPage() {

  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [editing, setEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isMainBranch, setIsMainBranch] = useState(false);

  const [branch, setBranch] = useState<Branch>({
    BranchCode: "",
    BranchName: "",
    Location: "",
    AddressL1: "",
    AddressL2: "",
    AddressL3: "",
    Manager: "",
    TP: "",
    Mobile: "",
    Status: "",
    Note: "",
    Id: 0,
    StartDate: new Date().toISOString().split("T")[0],
    IsMainBranch: false
  });


  // Auto generate branch code

  //generateBranchCode()

  async function generateBranchCode() {

     const response = await fetch(
    "/api/branch/next-code"
  );

 

  const data = await response.json();
  console.log(data)
    if(data.success){

    setBranch((prev)=>({
      ...prev,
      BranchCode:data.code
    }));

  }


  }


useEffect(()=>{
   generateBranchCode();
   loadBranches();
},[]);

 async function loadBranches() {
     const response = await fetch("/api/branch"); 
     const data = await response.json();
     console.log(data.data)
     setBranches(data.data);
     console.log(branches)
    
    }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {

    setBranch({
      ...branch,
      [e.target.name]: e.target.value,
    });

  }

  async function clearForm() {
     setEditing(false); setSelectedId(null);
     setIsMainBranch(false); // Reset the IsMainBranch checkbox state
      setBranch({
         BranchCode: "",
    BranchName: "",
    Location: "",
    AddressL1: "",
    AddressL2: "",
    AddressL3: "",
    Manager: "",
    TP: "",
    Mobile: "",
    Status: "",
    Note: "",
    Id: 0,
    IsMainBranch: false,
    StartDate: new Date().toISOString().split("T")[0]})
      
      await generateBranchCode();
    
    }


    function editBranch(branch: Branch) { 
      console.log(branch)
      setIsMainBranch(branch.IsMainBranch ?? false); // Set the checkbox state based on the branch data
      setBranch({
         BranchCode: branch.BranchCode ?? "",
          BranchName: branch.BranchName ?? "", 
          Location: branch.Location ?? "", 
          AddressL1: branch.AddressL1 ?? "",
           AddressL2: branch.AddressL2 ?? "", 
           AddressL3: branch.AddressL3 ?? "",
           Manager: branch.Manager ?? "",
            TP: branch.TP ?? "", Mobile: branch.Mobile ?? "",
             Status: branch.Status ?? "", 
             Note: branch.Note ?? "",
              StartDate: branch.StartDate ?? "",
              Id:branch.Id,
              IsMainBranch: isMainBranch ?? false }); 

              setSelectedId(branch.Id); setEditing(true); }


  async function handleSubmit( e: React.FormEvent<HTMLFormElement> )
   { 
    e.preventDefault(); 
     branch.IsMainBranch = isMainBranch; // Set the IsMainBranch property based on the checkbox state
    console.log("Submitting branch:", branch);
   
    const url = editing ? `/api/branch` : "/api/branch"; 
    const method = editing ? "PUT" : "POST"; 
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json", }, body: JSON.stringify(branch), });
     if (response.ok) {
       alert(editing ? "Branch updated successfully." : "Branch created successfully."); clearForm(); loadBranches();
       } else
         { alert("Failed to save branch."); 

         } 
        }


  return (

    <div className="rounded-xl bg-white p-8 shadow">


      <h1 className="mb-6 text-2xl font-bold">
        Add New Branch
      </h1>



      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-5 md:grid-cols-2"
      >


        <div>

          <label>
            Branch Code
          </label>
            <div>
            
           <div className="flex items-center gap-2">

               <input
            name="BranchCode"
            value={branch.BranchCode}
            readOnly
            className="w-max rounded border bg-gray-100 p-2"
          />

                  <input
                    id="IsMainBranch"
                    name="IsMainBranch"
                    type="checkbox"
                    checked={isMainBranch}
                    onChange={(e) => setIsMainBranch(e.target.checked)}
                    className="h-4 w-4"
                  />

                  <label htmlFor="IsMainBranch">
                    Set as Main Branch
                  </label>
                  
                </div>
            </div>
         


        </div>



        <div>

          <label>
            Starting Date
          </label>

          <input
            type="date"
            name="StartDate"
            value={branch.StartDate}
            onChange={handleChange}
            className="w-full rounded border p-2"
          />

        </div>



        <div>

          <label>
            Branch Name
          </label>

          <input
            name="BranchName"
            type="text"
            value={branch.BranchName}
            onChange={handleChange}
            className="w-full rounded border p-2"
            required
          />

        </div>



        <div>

          <label>
            Location
          </label>

          <input
            name="Location"
            value={branch.Location}
            onChange={handleChange}
            className="w-full rounded border p-2"
          />

        </div>



        <div className="md:col-span-2">

          <label>
            Address Line 1
          </label>

          <input
            name="AddressL1"
            value={branch.AddressL1}
            onChange={handleChange}
            className="w-full rounded border p-2"
          />

        </div>



        <div className="md:col-span-2">

          <label>
            Address Line 2
          </label>

          <input
            name="AddressL2"
            value={branch.AddressL2}
            onChange={handleChange}
            className="w-full rounded border p-2"
          />

        </div>



        <div className="md:col-span-2">

          <label>
            Address Line 3
          </label>

          <input
            name="AddressL3"
            value={branch.AddressL3}
            onChange={handleChange}
            className="w-full rounded border p-2"
          />

        </div>




        <div>

          <label>
            Manager
          </label>

          <input
            name="Manager"
            value={branch.Manager}
            onChange={handleChange}
            className="w-full rounded border p-2"
          />

        </div>




        <div>

          <label>
            Telephone
          </label>

          <input
            name="TP"
            value={branch.TP}
            onChange={handleChange}
            className="w-full rounded border p-2"
          />

        </div>




        <div>

          <label>
            Mobile
          </label>

          <input
            name="Mobile"
            value={branch.Mobile}
            onChange={handleChange}
            className="w-full rounded border p-2"
          />

        </div>




        <div>

          <label>
            State
          </label>

          <select
            name="Status"
            value={branch.Status}
            onChange={handleChange}
            className="w-full rounded border p-2"
            required
          >

            <option value="">
              Select State
            </option>


            {
              status.map((item)=>(
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))
            }


          </select>

        </div>




        <div className="md:col-span-2">

          <label>
            Note
          </label>

          <textarea
            name="Note"
            value={branch.Note}
            onChange={handleChange}
            className="w-full rounded border p-2"
            rows={4}
          />

        </div>




<div className="md:col-span-2 flex gap-4">

  <button
    type="submit"
    className="
      w-40
      rounded-lg
      bg-blue-600
      px-6
      py-3
      text-white
      shadow
      hover:bg-blue-700
      transition
    "
   
  >
     {editing ? "Update Branch" : "Save Branch"}
  </button>


  


  <button
    type="button"
    className="
      w-40
      rounded-lg
      bg-gray-500
      px-6
      py-3
      text-white
      shadow
      hover:bg-gray-600
      transition
    "
    onClick={clearForm}
  >
    Clear
  </button>

</div>

        
         



      </form>

    < div className="my-8">
   <div className="w-full rounded-xl border border-gray-200 bg-white shadow-lg">

  {/* Responsive wrapper */}
  <div className="max-h-125 overflow-x-auto overflow-y-auto rounded-xl">

    <table className="min-w-full table-fixed border-collapse">

      <thead className="sticky top-0 bg-slate-800 text-white">

        <tr>
          <th className="w-32 px-4 py-3 text-left text-sm font-semibold">
            Branch Code
          </th>

          <th className="w-48 px-4 py-3 text-left text-sm font-semibold">
            Branch Name
          </th>

          <th className="w-40 px-4 py-3 text-left text-sm font-semibold">
            Manager
          </th>

          <th className="w-40 px-4 py-3 text-left text-sm font-semibold">
            Location
          </th>

            <th className="w-40 px-4 py-3 text-left text-sm font-semibold">
           TP
          </th>

            <th className="w-40 px-4 py-3 text-left text-sm font-semibold">
            Mobile
          </th>

          <th className="w-32 px-4 py-3 text-center text-sm font-semibold">
            State
          </th>

          <th className="w-32 px-4 py-3 text-center text-sm font-semibold">
            Main Branch
          </th>

          <th className="w-28 px-4 py-3 text-center text-sm font-semibold">
            Action
          </th>

        </tr>

      </thead>


      <tbody className="divide-y divide-gray-200">


        {branches.map((branch) => (

          <tr
            key={branch.Id}
            className="
              hover:bg-blue-50
              transition
              duration-200
            "
          >

            <td className="px-4 py-3 text-sm text-gray-700">
              {branch.BranchCode ?? "N/A"}
            </td>


            <td className="px-4 py-3 text-sm font-medium text-gray-800">
              {branch.BranchName ?? "N/A"}
            </td>


            <td className="px-4 py-3 text-sm text-gray-700">
              {branch.Manager ?? "N/A"}
            </td>


              <td className="px-4 py-3 text-sm text-gray-700">
                {branch.Location ?? "N/A"}
              </td>

              
              <td className="px-4 py-3 text-sm text-gray-700">
                {branch.TP ?? "N/A"}
              </td>



              <td className="px-4 py-3 text-sm text-gray-700">
                {branch.Mobile ?? "N/A"}
              </td>



            <td className="px-4 py-3 text-center">

              <span
                className={`
                  rounded-full
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  ${
                    branch.Status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }
                `}
              >
                {branch.Status ?? "N/A"}
              </span>

            </td>

                    <td className="px-4 py-3 text-center">

              <span
                className={`
                  rounded-full
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  ${
                    branch.IsMainBranch === true
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                  }
                `}
              >
                {branch.IsMainBranch === true ? "Yes" : "No"}
              </span>

            </td>


            <td className="px-4 py-3 text-center">

              <button
                className="
                  rounded-lg
                  bg-blue-600
                  px-4
                  py-2
                  text-sm
                  text-white
                  shadow
                  hover:bg-blue-700
                  transition
                " 
                onClick={() => editBranch(branch)}
              >
                Edit
              </button>

            </td>


          </tr>

        ))}


        {
          branches.length === 0 && (

            <tr>

              <td
                colSpan={6}
                className="
                  py-8
                  text-center
                  text-gray-500
                "
              >
                No branches found
              </td>

            </tr>

          )
        }


      </tbody>

    </table>

  </div>

</div>
    </div>

    </div>

  );
}
