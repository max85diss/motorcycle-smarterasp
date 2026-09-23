
"use client";
import { useEffect } from "react";
import { useState } from "react";

interface UserPosition {
  EmpCode: string;
  Username: string;
  Password: string;
  Position: string;
  Location: string;
  State: string;
  Date: string;
  UserCode: string;
  Fullname: string;
  BranchCode: string;
}

export interface UserPositionTable {
  EmpCode: string;
  Username: string;
  Fullname: string;
  Position: string;
  Location: string;
  State: string;
  Date: string;      // or Date if you convert it after fetching
  UserCode: string;
  BranchCode: string;
}

interface BranchLookup { 
  BranchCode: string;
   BranchName: string; 
   Location: string; 
  }

interface UserLookup {
     UserCode: string;
      Fullname: string; 
    }

const initialForm: UserPosition = {
  EmpCode: "",
  Username: "",
  Password: "",
  Position: "",
  Location: "",
  State: "Active",
  Date: new Date().toISOString().split("T")[0],
  UserCode: "",
  Fullname: "",
  BranchCode: "",
};

export default function UserPositionPage() {

const [form, setForm] = useState<UserPosition>(initialForm);
const [userList, setUserList] = useState<UserLookup[]>([]);

const [branchList, setBranchList] = useState<BranchLookup[]>([]);

const [UserPositionTable, setUserPositionTable] = useState<UserPositionTable[]>([]);

const [isEdit, setIsEdit] = useState(false);


//saving data to the database
async function saveUserPosition() { 
 

}

//saving and updating data to the database
async function handleSubmit(
  e: React.FormEvent<HTMLFormElement>
) {

  e.preventDefault();

  console.log(form);

  const x : UserPosition = {
    EmpCode: form.EmpCode,
    Username: form.Username,
    Password: form.Password,
    Position: form.Position,
    Location: branchList.find((b) => b.BranchCode === form.Location)?.Location || "",
    State: form.State,
    Date: form.Date,
    UserCode: form.UserCode,
    Fullname: form.Fullname,
    BranchCode: form.Location, // Assuming BranchCode is the same as Location for now; adjust as needed
  };
  console.log("Submitting form data:", x);

   if (!form.Username.trim()) { 
    alert("Username is required."); return; } 
    if (!x.Password.trim()) { 
      alert("Password is required."); return; } 
      if (!x.UserCode) {
         alert("Please select a user."); return; } 
         if (!x.BranchCode) { 
          alert("Please select a branch."); return; } 

           if (!x.Position.trim()) { 
          alert("Please select a position."); return; } 

           if (!x.Location.trim()) { 
          alert("Please select a Location."); return; } 
          alert(isEdit ? "Updating user position..." : "Saving user position...");
          const url = "/api/users/roles/assign-roles"
          const method = isEdit ? "PUT" : "POST";
          try { 
            const response = await fetch( 
              url,
               {
                method, 
                headers:{
                  "Content-Type":"application/json"
                      },
                 body:JSON.stringify(x)
               } 
              );
            
            //const result = await response.json(); 
            console.log("Response from server:", response);
            if (response.ok) {
               alert(
        isEdit
        ?"User updated"
        :"User saved"
      );

               }else{
                console.error("Failed to save user position:", response.statusText);
                alert("Failed to save user position.");
              }
               
               
               clearForm();
                loadData(); 
              
              } catch (error) {
                 console.error(error); 
                 alert("Unable to save data."); } }

function clearForm(){
  setForm(initialForm);
  setIsEdit(false);
  generateEmpCode();
  loadUserPositions();
  loadBranches();
}

function loadData(){

}

function editUser(item: UserPositionTable) {
  setIsEdit(true);
  console.log( item);
 
  let branch = branchList.find((b) => b.BranchName === item.BranchCode);
  console.log("Found branch:", branch?.BranchCode);
  setForm({
    EmpCode: item.EmpCode,
    Username: item.Username,
    Password: "",
    BranchCode: branch ? branch.BranchCode : "",
    Position: item.Position,
    Location: item.BranchCode, // Assuming Location is the same as BranchCode; adjust if needed
    State: item.State,
    Date: item.Date
      ? item.Date.toString().split("T")[0]
      : "",
    UserCode: item.UserCode,
    Fullname: item.Fullname,
  });
}
//loading table data

  async function loadUserPositions() {
    const response = await fetch("/api/users/roles/assign-roles");
    const data = await response.json();

    if (data.success) {
      // Handle the loaded user positions data
      console.log("User Positions:", data.data);
      setUserPositionTable(data.data);
    }else{
      console.error("Failed to load user positions:", data.message);
    }
  }
  

  async function loadBranches() {
     const response = await fetch( "/api/lookup/branches" );
      const data = await response.json();
       if (data.success) { setBranchList(data.data); }
       }


    async function loadUsers() 
    { 
        const response = await fetch( "/api/lookup/user" );
         const data = await response.json();
          if (data.success) {
             setUserList(data.data); 

          } 
        }

        function handleUserChange( e: React.ChangeEvent<HTMLSelectElement> ) { 
            const code = e.target.value;
             const selectedUser = userList.find( x => x.UserCode === code ); 
             setForm({ ...form, UserCode: code, Fullname: selectedUser?.Fullname ?? "" }); 
            }

    async function generateEmpCode() {
         const response = await fetch( "/api/users/roles/next-code" ); 
         const data = await response.json();
          if (data.success) { setForm((prev) => ({ ...prev, EmpCode: data.code, }));
         } 
        }

           useEffect(() => { 
            loadUsers();
            loadBranches();
            loadUserPositions();
            generateEmpCode(); }, []);


      function handleChange(
  e: React.ChangeEvent<
    HTMLInputElement | HTMLSelectElement
  >
) {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });
}      


  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* Page Header */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            User Position Management
          </h1>
          <p className="text-sm text-gray-500">
            Create and manage user positions
          </p>
        </div>
      </div>


      {/* Form */}
      <form onSubmit={handleSubmit}>  

      <div className="rounded-xl bg-white shadow-lg">

        <div className="border-b bg-blue-600 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            User Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2 lg:grid-cols-3">


          {/* Employee Code */}

          <div>

            <label className="mb-1 block text-sm font-medium">
              Employee Code
            </label>

            <input
                name="EmpCode"
            value={form.EmpCode}
              type="text"
               onChange={handleChange}
              readOnly
              placeholder="Auto Generated"
              className="w-full rounded-lg border bg-gray-100 px-3 py-2"
            />

          </div>



          {/* Date */}

          <div>

            <label className="mb-1 block text-sm font-medium">
              Date
            </label>

            <input
              type="date"
              name="Date"
              value={form.Date}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />

          </div>



          {/* State */}

          <div>

            <label className="mb-1 block text-sm font-medium">
              Status
            </label>

            <select
              name="State"
              value={form.State}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            >

              <option>Active</option>
              <option>Deactive</option>
              <option>Hold</option>

            </select>

          </div>



          {/* User Code */}

          <div>

            <label className="mb-1 block text-sm font-medium">
              User Code
            </label>

           <select name="UserCode" value={form.UserCode} onChange={handleUserChange} className=" w-full rounded-lg border p-2 " > <option value=""> Select User </option>
            { userList.map((item) => ( <option key={item.UserCode} value={item.UserCode} > {item.UserCode} </option> )) }
             </select>

          </div>



          {/* Full Name */}

          <div>

            <label className="mb-1 block text-sm font-medium">
              Full Name
            </label>

            <input
              type="text"
              name="Fullname"
              value={form.Fullname}
              onChange={handleChange}
              readOnly
              className="w-full rounded-lg border bg-gray-100 px-3 py-2"
            />

          </div>



          {/* Username */}

          <div>

            <label className="mb-1 block text-sm font-medium">
              Username
            </label>

            <input
              type="text"
              name="Username"
              value={form.Username}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />

          </div>



          {/* Password */}

          <div>

            <label className="mb-1 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              name="Password"
              value={form.Password}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />

          </div>



          {/* Position */}

          <div>

            <label className="mb-1 block text-sm font-medium">
              Position
            </label>

             <select
              name="Position"
              value={form.Position}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            >

              <option>Manager</option>
              <option>Supervisor</option>
              <option>Documentation</option>
              <option>Cashier</option>
              <option>Sales-executive</option>

            </select>

          </div>



          {/* Location */}

          <div>

            <label className="mb-1 block text-sm font-medium">
              Location
            </label>

          <select name="Location" value={form.Location} onChange={handleChange} className=" w-75 rounded-lg border p-2 " > 
            <option value=""> Select Branch </option>

             { branchList.map((item) => ( <option key={item.BranchCode} value={item.BranchCode} > {item.BranchName} </option> )) }
             
              </select>

               <input name="BranchCode"
      value={branchList.find((b) => b.BranchCode === form.Location)?.BranchCode || ""}
      readOnly
      className="w-28 rounded-lg border bg-gray-100 p-2 text-center font-semibold"
    />

          </div>

        </div>



        {/* Buttons */}

        <div className="flex flex-wrap gap-3 border-t bg-gray-50 p-5">

         <button
           type="submit"
             className="rounded-lg bg-blue-600 px-5 py-2 text-white"
              >
            {isEdit ? "Update" : "Save"}
            </button>

          <button type="button"
            onClick={clearForm}
            className="rounded-lg bg-gray-600 px-6 py-2 font-medium text-white hover:bg-gray-700"
          >
            Clear
          </button>

        </div>

      </div>

</form>

      {/* Table */}

      <div className="mt-8 rounded-xl bg-white shadow-lg">

        <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">

          <h2 className="text-lg font-semibold">
            User Position List
          </h2>

          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-lg border px-4 py-2 md:w-72"
          />

        </div>


        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-200">

              <tr>

                <th className="px-4 py-3 text-left">
                  Action
                </th>

                <th className="px-4 py-3 text-left">
                  Emp Code
                </th>

                <th className="px-4 py-3 text-left">
                  Username
                </th>

                <th className="px-4 py-3 text-left">
                  Full Name
                </th>

                <th className="px-4 py-3 text-left">
                  Position
                </th>

                <th className="px-4 py-3 text-left">
                  Branch
                </th>

                <th className="px-4 py-3 text-left">
                  Location
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-100">
              {UserPositionTable.map((item) => (
                
                <tr key={item.EmpCode} className="border-b hover:bg-gray-50"> 

                <td className="p-3">

              <button onClick={()=>editUser(item)} 
               className="rounded bg-indigo-600 px-4 py-1 text-white hover:bg-indigo-700">
              Edit
            </button>

              </td>

                <td className="p-3">{item.EmpCode}</td>
                <td className="p-3">{item.Username} {item.UserCode}</td>
                <td className="p-3">{item.Fullname}</td>
                <td className="p-3">{item.Position}</td>
                 <td className="p-3">{item.BranchCode}</td>
                <td className="p-3">{item.Location}</td>
                <td className="p-3">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    {item.State}
                  </span>
                </td>
              </tr>
                ))}

            
            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

