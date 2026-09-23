"use client";

import { useEffect, useState } from "react";


interface User {
  UserCode: string;
  Username: string;
  Fullname: string;
  NIC: string;
  Address: string;
  TP: string;
  Mobile: string;
  Photo: string;
  State: string;
}


const emptyUser: User = {
  UserCode: "",
  Username: "",
  Fullname: "",
  NIC: "",
  Address: "",
  TP: "",
  Mobile: "",
  Photo: "",
  State: "Active",
};



export default function UsersPage() {


  const [user,setUser] = useState<User>(emptyUser);

  const [users,setUsers] = useState<User[]>([]);

  const [editMode,setEditMode] = useState(false);

  const [preview,setPreview] = useState("");



  useEffect(()=>{

    loadUsers();
    generateEmpCode();

  },[]);




  async function loadUsers(){

    const res = await fetch("/api/users");

    const data = await res.json();

    setUsers(data.data || []);

  }



  const uploadPhoto = async ( file: File ) => {
     const formData = new FormData();
     const oldPhotoPath = user.Photo ? user.Photo.replace(`${window.location.origin}/`, "") : null;
     console.log("Old photo path:", oldPhotoPath);
     formData.append("oldPhotoPath", oldPhotoPath || "");
      formData.append("file", file);
       const response = await fetch( "/api/upload/user-photo", { method: "POST", body: formData, } );
        const data = await response.json();
         if (data.success) { setUser((prev) => ({ ...prev, Photo: data.imageUrl, })); 
         setPreview(data.imageUrl); }
         };



  async function generateEmpCode(){

    const res = await fetch(
      "/api/users/next-code"
    );

    const data = await res.json();


    setUser(prev=>({
      ...prev,
      UserCode:data.code
    }));

  }




  function handleChange(
    e:
    React.ChangeEvent<
    HTMLInputElement |
    HTMLTextAreaElement |
    HTMLSelectElement
    >
  ){

    setUser({
      ...user,
      [e.target.name]:e.target.value
    });

  }




  function handlePhoto(
    e:React.ChangeEvent<HTMLInputElement>
  ){

    const file=e.target.files?.[0];


    if(file){

      uploadPhoto(file);
      setPreview(
        URL.createObjectURL(file)
      );


      //setUser({
       // ...user,
       // Photo:file.name
     // });

    }

  }





  async function saveUser(){


    const method =
      editMode
      ? "PUT"
      : "POST";


    const url =
      editMode
      ? `/api/users`
      : "/api/users";

   // uploadPhoto(file);
    console.log("Saving user:", user);
    const res = await fetch(
      url,
      {
        method,
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(user)
      }
    );



    if(res.ok){

      alert(
        editMode
        ?"User updated"
        :"User saved"
      );


      clearForm();

      loadUsers();

    }

  }





  function editUser(item:User){

    setUser(item);

    setPreview(item.Photo);

    setEditMode(true);

  }





  function clearForm(){

    setUser(emptyUser);

    setPreview("");

    setEditMode(false);

    generateEmpCode();

  }





  return (

<div className="
min-h-screen
bg-gray-100
p-4
md:p-8
">


<h1 className="
mb-6
text-3xl
font-bold
text-gray-800
">
User Management
</h1>



{/* FORM CARD */}

<div className="
rounded-xl
bg-white
p-6
shadow-lg
">


<div className="
grid
grid-cols-1
gap-5
md:grid-cols-2
lg:grid-cols-3
">



{/* PHOTO */}

<div>

<label className="font-medium">
Photo
</label>


<input
type="file"
accept="image/*"
onChange={handlePhoto}
className="
mt-2
w-full
rounded-lg
border
p-2
"
/>


{
preview &&
<img
src={preview}
className="
mt-3
h-24
w-24
rounded-full
object-cover
border
"
/>
}


</div>





<div>

<label>
Employee Code
</label>


<input
name="UserCode"
value={user.UserCode}
readOnly
className="
w-full
rounded-lg
border
bg-gray-100
p-2
"
/>


</div>




<div>

<label>
Username
</label>

<input
name="Username"
value={user.Username}
onChange={handleChange}
className="
w-full
rounded-lg
border
p-2
"
/>

</div>





<div>

<label>
Full Name
</label>

<input
name="Fullname"
value={user.Fullname}
onChange={handleChange}
className="
w-full
rounded-lg
border
p-2
"
/>

</div>





<div>

<label>
NIC
</label>

<input
name="NIC"
value={user.NIC}
onChange={handleChange}
className="
w-full
rounded-lg
border
p-2
"
/>

</div>





<div>

<label>
Telephone
</label>

<input
name="TP"
value={user.TP}
onChange={handleChange}
className="
w-full
rounded-lg
border
p-2
"
/>

</div>





<div>

<label>
Mobile
</label>

<input
name="Mobile"
value={user.Mobile}
onChange={handleChange}
className="
w-full
rounded-lg
border
p-2
"
/>

</div>





<div>

<label>
Status
</label>


<select
name="State"
value={user.State}
onChange={handleChange}
className="
w-full
rounded-lg
border
p-2
"
>

<option>
Active
</option>

<option>
Deactive
</option>

<option>
Hold
</option>

</select>


</div>





<div className="
md:col-span-2
lg:col-span-3
">


<label>
Address
</label>


<textarea
name="Address"
value={user.Address}
onChange={handleChange}
rows={3}
className="
w-full
rounded-lg
border
p-2
"
/>


</div>



</div>





<div className="
mt-6
flex
gap-3
">


<button
onClick={saveUser}
className="
rounded-lg
bg-blue-600
px-6
py-2
text-white
hover:bg-blue-700
"
>

{
editMode
?"Update"
:"Save"
}

</button>



<button
onClick={clearForm}
className="
rounded-lg
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


</div>





{/* TABLE */}


<div className="
mt-8
rounded-xl
bg-white
p-5
shadow-lg
">


<h2 className="
mb-4
text-xl
font-semibold
">
User List
</h2>



<div className="
overflow-x-auto
">


<table className="
min-w-full
divide-y
divide-gray-200
">


<thead className="bg-gray-50">

<tr>


<th className="p-3 text-left">
Photo
</th>

<th className="p-3 text-left">
User Code
</th>


<th className="p-3 text-left">
Username
</th>


<th className="p-3 text-left">
Name
</th>


<th className="p-3 text-left">
Mobile
</th>


<th className="p-3 text-left">
Status
</th>


<th className="p-3">
Action
</th>


</tr>

</thead>



<tbody
className="
divide-y
divide-gray-100
"
>


{
users.map((item)=>(


<tr
key={item.UserCode}
className="
hover:bg-gray-50
"
>


<td className="p-3">

{
item.Photo
?
<img
src={item.Photo}
className="
h-10
w-10
rounded-full
object-cover
"
/>
:
<div className="
h-10
w-10
rounded-full
bg-gray-300
flex
items-center
justify-center
">
?
</div>
}

</td>




<td className="p-3">
{item.UserCode}
</td>


<td className="p-3">
{item.Username}
</td>


<td className="p-3">
{item.Fullname}
</td>


<td className="p-3">
{item.Mobile}
</td>



<td className="p-3">


<span
className={`
rounded-full
px-3
py-1
text-sm

${
item.State==="Active"
?"bg-green-100 text-green-700"
:
item.State==="Hold"
?"bg-yellow-100 text-yellow-700"
:
"bg-red-100 text-red-700"
}

`}
>

{item.State}

</span>


</td>



<td className="p-3">

<button
onClick={()=>editUser(item)}
className="
rounded-lg
bg-indigo-600
px-4
py-1
text-white
"
>
Edit
</button>

</td>


</tr>


))
}

 {
          users.length === 0 && (

            <tr>

              <td
                colSpan={6}
                className="
                  py-8
                  text-center
                  text-gray-500
                "
              >
                No user found
              </td>

            </tr>

          )
        }

</tbody>


</table>


</div>


</div>



</div>

  );
}