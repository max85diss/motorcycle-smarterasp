

import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getSqlConnectionPool } from "@/lib/db";


export async function GET(request: NextRequest) {
    try {
    const pool = await getSqlConnectionPool();

    const result = await pool.request().query(`
      SELECT
        A.EmpCode,
        A.Username,
        B.Fullname,
        A.Position,
        A.Location,
        A.State,
        A.Date,
        A.UserCode,
        A.BranchCode
      FROM tb_userPosition A
      LEFT JOIN tb_users B ON A.UserCode = B.UserCode
      WHERE B.IsDeleted = 0
      ORDER BY A.ID
    `);

    return NextResponse.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load users.",
      },
      {
        status: 500,
      }
    );
  }
}

 export async function POST(request: NextRequest) { 
    try { 
        const body = await request.json(); 
        console.log("Received request body:", body); // Log the received request body for debugging 
        const pool = await getSqlConnectionPool();
         await pool .request() 
         .input("EmpCode", sql.VarChar, body.EmpCode) 
         .input("Username", sql.VarChar, body.Username) 
         .input("Password", sql.VarChar, body.Password)
          .input("Position", sql.VarChar, body.Position) 
          .input("Location", sql.VarChar, body.Location)
           .input("State", sql.VarChar, body.State) 
           .input("Date", sql.Date, body.Date) 
           .input("UserCode", sql.VarChar, body.UserCode)
            .input("BranchCode", sql.VarChar, body.BranchCode) 
            .query(` INSERT INTO tb_userPosition (
                 EmpCode,
                  Username,
                   Password, 
                   Position,
                    Location,
                     State, 
                     Date, 
                     UserCode, 
                     BranchCode ) VALUES ( 
                     @EmpCode,
                      @Username,
                       @Password,
                        @Position, 
                        @Location,
                         @State,
                          @Date, 
                          @UserCode, 
                          @BranchCode ) `);
                          
                          return NextResponse.json({ success: true, 
                            message: "User Position saved successfully." }); 
                        } catch (error) 
                        { 
                            console.error(error); 
                            return NextResponse.json( { success: false, 
                                message: "Unable to save record." }, 
                                { status: 500 } ); }
                             }



export async function PUT( request: NextRequest, { params }: { params: Promise<{ empCode: string }> } ) { 
  try {
    
      const body = await request.json();

       const pool = await getSqlConnectionPool();

        await pool .request() 
        .input("EmpCode", sql.VarChar, body.EmpCode) 
        .input("Username", sql.VarChar, body.Username) 
        .input("Password", sql.VarChar, body.Password) 
        .input("Position", sql.VarChar, body.Position) 
        .input("Location", sql.VarChar, body.Location) 
        .input("State", sql.VarChar, body.State) 
        .input("Date", sql.Date, body.Date) 
        .input("UserCode", sql.VarChar, body.UserCode) 
        .input("BranchCode", sql.VarChar, body.BranchCode) 
        .query(` UPDATE tb_userPosition SET
           Username = @Username, 
           Password = @Password,
            Position = @Position, 
            Location = @Location,
             State = @State,
              UserCode = @UserCode, 
              BranchCode = @BranchCode 
              WHERE EmpCode = @EmpCode `);
              
              return NextResponse.json({ 
                success: true,
                 message: "User Position updated successfully." });
                 } catch (error) 
                 {
                   console.error(error);
                    return NextResponse.json( { success: false, message: "Unable to update record." }, { status: 500 } ); 
                  } 
                }
