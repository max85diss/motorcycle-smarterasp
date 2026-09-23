
import { cookies } from "next/headers";

export interface SessionUser {
     EmpCode: string; 
     EmpName: string;
      Position: string;
      BranchName: string;
      BranchCode:string; 
      Photo:string;
}

export async function getSessionUser(): Promise<SessionUser> {

    const cookieStore = await cookies();

    const userCookie =
        cookieStore.get("user");

    if (!userCookie) {
        throw new Error("Unauthorized");
    }

    const user =
        JSON.parse(userCookie.value);

    return {
        EmpCode: user.empCode,
        EmpName: user.empName,
        BranchCode: user.branchCode,
        BranchName: user.location,
        Position: user.position,
        Photo: user.photo
    };
}