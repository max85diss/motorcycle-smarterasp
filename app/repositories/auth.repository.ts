

import { getSqlConnectionPool } from "@/lib/db";
 import sql from "mssql";


 export class AuthRepository { 

    static async getUserByUsername(username: string)
     {
            
        const pool = await getSqlConnectionPool(); 
        const result = await pool .request() .input("username", sql.VarChar, username) .query(` SELECT EmpCode, Username, Password, Position, Location,BranchCode FROM tb_userPosition WHERE EmpCode = @username `); 
        
        if (result.recordset.length === 0) { return null; }
        
        return result.recordset[0];
    
    } 

}