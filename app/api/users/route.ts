
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getSqlConnectionPool } from "@/lib/db";

// GET: Get all active users
export async function GET() {
  try {
    const pool = await getSqlConnectionPool();

    const result = await pool.request().query(`
      SELECT
        UserCode,
        Username,
        Fullname,
        NIC,
        Address,
        TP,
        Mobile,
        Photo,
        State,
        CreatedDate,
        ModifiedDate
      FROM tb_users
      WHERE IsDeleted = 0
      ORDER BY Fullname
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

// POST: Create user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const pool = await getSqlConnectionPool();
    console.log("Creating user with data:", body);
    await pool
      .request()
      .input("UserCode", sql.VarChar, body.UserCode)
      .input("Username", sql.VarChar, body.Username)
      .input("Fullname", sql.VarChar, body.Fullname)
      .input("NIC", sql.VarChar, body.NIC)
      .input("Address", sql.VarChar, body.Address)
      .input("TP", sql.VarChar, body.TP)
      .input("Mobile", sql.VarChar, body.Mobile)
      .input("Photo", sql.VarChar, body.Photo)
      .input("State", sql.VarChar, body.State)
      .query(`
        INSERT INTO tb_users
        (
            UserCode,
            Username,
            Fullname,
            NIC,
            Address,
            TP,
            Mobile,
            Photo,
            State,
            IsDeleted,
            CreatedDate,
            ModifiedDate
        )
        VALUES
        (
            @UserCode,
            @Username,
            @Fullname,
            @NIC,
            @Address,
            @TP,
            @Mobile,
            @Photo,
            @State,
            0,
            GETDATE(),
            GETDATE()
        )
      `);

    return NextResponse.json({
      success: true,
      message: "User created successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user.",
      },
      {
        status: 500,
      }
    );
  }
}




// PUT: Update user
export async function PUT(
  request: NextRequest
) {
  try {
    //const { userCode } = await params;
    const body = await request.json();
    console.log("Updating user with data:", body);
    const pool = await getSqlConnectionPool();

    await pool
      .request()
      .input("UserCode", sql.VarChar, body.UserCode)
      .input("Username", sql.VarChar, body.Username)
      .input("Fullname", sql.VarChar, body.Fullname)
      .input("NIC", sql.VarChar, body.NIC)
      .input("Address", sql.VarChar, body.Address)
      .input("TP", sql.VarChar, body.TP)
      .input("Mobile", sql.VarChar, body.Mobile)
      .input("Photo", sql.VarChar, body.Photo)
      .input("State", sql.VarChar, body.State)
      .query(`
        UPDATE tb_users
        SET
            Username = @Username,
            Fullname = @Fullname,
            NIC = @NIC,
            Address = @Address,
            TP = @TP,
            Mobile = @Mobile,
            Photo = @Photo,
            State = @State,
            ModifiedDate = GETDATE()
        WHERE UserCode = @UserCode
      `);

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user.",
      },
      {
        status: 500,
      }
    );
  }
}

