

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { redirect, useRouter } from 'next/navigation';
import { use } from "react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

   async function loginAction(formData: FormData) {

     const username = formData.get('username')
     const password = formData.get('password')

     //alert(username);
     const response = await fetch("/api/auth/login", {
    
    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

   
    body: JSON.stringify({
        username,
        password
    })

});

 console.log(response);

if (response.ok) {
  const data = await response.json();
    const user = data.user;
    if(user){
      //const router = useRouter()
      const username = user.username;
      const location = user.location;
      const position = user.position;

      console.log(location)
      if (position ==="Manager")
      {
        console.log("working")
        redirect(`/manager?username=${username}?location=${location}`)

      }else if (position === "Cashier")
      {
       // router.push("/cashier")
      }else if (position ==="Documentation")
      {
        //router.push("/documentation")
      }else{
        //router.push("/")
      }

    }
    
}
  }



  return (
    <form action={loginAction} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input id="username" name="username" type="text" placeholder="" required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" name="password" type="password" required />
        </Field>
        <Field>
          <Button type="submit">Login</Button>
        </Field>
      
      </FieldGroup>
    </form>
  )
}
