import { getSqlConnectionPool } from "@/lib/db"; 
import sql from "mssql";

export class UserRepository { 
    static async getUserByUsername(username: string) { 
        console.log(username)
        const pool = await getSqlConnectionPool();

         const result = await pool .request() .input("username", sql.VarChar, username) .query(` SELECT A.EmpCode, A.Username, A.Password, A.Position, A.Location, A.BranchCode,B.Photo FROM tb_userPosition A LEFT JOIN tb_users B ON A.UserCode = B.UserCode WHERE A.EmpCode = @username `);
         
         console.log(result);
         
         if (result.recordset.length === 0) { return null; }
         
         return result.recordset[0];
        
        } 
         
         static async getUsers() {
             const pool = await getSqlConnectionPool();
              const result = await pool .request() .query(` SELECT EmpCode, Username, Position, Location,BranchCode FROM tb_userPosition `);
               return result.recordset; 
            } 
            
            static async getUserById(empCode: string) {
                 const pool = await getSqlConnectionPool(); 
                 const result = await pool .request() .input("empCode", sql.VarChar, empCode) .query(` SELECT A.EmpCode, A.Username, A.Password, A.Position, A.Location, A.BranchCode,B.Photo FROM tb_userPosition A LEFT JOIN tb_users B ON A.UserCode = B.UserCode WHERE A.EmpCode = @empCode `);
                  if (result.recordset.length === 0) { return null; } return result.recordset[0]; 
                }
            
            }



    async function getUserPhotoById(empCode: string) {
   const pool = await getSqlConnectionPool(); 
                 const result = await pool .request() .input("empCode", sql.VarChar, empCode) .query(` A.Photo  FROM tb_users A LEFT JOIN tb_userPosition B ON A.UserCode = B.UserCode WHERE B.EmpCode = @empCode `);
                  if (result.recordset.length === 0) { return null; } return result.recordset[0]; 
                }

