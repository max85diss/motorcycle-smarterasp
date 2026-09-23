
import { cookies } from "next/headers";
//import {decodeToken} from "./jwt";

export async function getUserCookies() {

    const cookieStore =
        await cookies();
     

    return {
        BranchCode:
            cookieStore.get("branchCode")?.value ?? "",

        BranchName:
            cookieStore.get("branchName")?.value ?? "",

        EmpCode:
            cookieStore.get("empCode")?.value ?? "",

        EmpName:
            cookieStore.get("empName")?.value ?? "",

        Position:
            cookieStore.get("position")?.value ?? "",
    };
}