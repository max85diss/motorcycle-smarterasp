
import { NextRequest, NextResponse } from "next/server";
import { getSqlConnectionPool } from "@/lib/db";

// GET: Get all branches
export async function GET() {
  try {
    const pool = await getSqlConnectionPool();

    const result = await pool.request().query(`
      SELECT
          Id,
          BranchCode,
          BranchName,
          Location,
          AddressL1,
          AddressL2,
          AddressL3,
          Manager,
          TP,
          Mobile,
          Status,
          Note,
          IsMainBranch,
          CONVERT(varchar(10), StartDate, 23) AS StartDate
      FROM tb_branch
      ORDER BY BranchName
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
        message: "Unable to load branches.",
      },
      {
        status: 500,
      }
    );
  }
}

// POST: Create a new branch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(body)
    const pool = await getSqlConnectionPool();

    await pool
      .request()
      .input("BranchCode", body.BranchCode)
      .input("BranchName", body.BranchName)
      .input("Location", body.Location)
      .input("AddressL1", body.AddressL1)
      .input("AddressL2", body.AddressL2)
      .input("AddressL3", body.AddressL3)
      .input("Manager", body.Manager)
      .input("TP", body.TP)
      .input("Mobile", body.Mobile)
      .input("BranchStatus", body.Status)
      .input("Note", body.Note)
      .input("StartDate", body.StartDate)
      .input("IsMainBranch", body.IsMainBranch)
      .query(`
        INSERT INTO tb_branch
        (
            BranchCode,
            BranchName,
            Location,
            AddressL1,
            AddressL2,
            AddressL3,
            Manager,
            TP,
            Mobile,
            Status,
            Note,
            StartDate,
            IsMainBranch
        )
        VALUES
        (
            @BranchCode,
            @BranchName,
            @Location,
            @AddressL1,
            @AddressL2,
            @AddressL3,
            @Manager,
            @TP,
            @Mobile,
            @BranchStatus,
            @Note,
            @StartDate,
            @IsMainBranch
        )
      `);

    return NextResponse.json({
      success: true,
      message: "Branch created successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save branch.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request: NextRequest) {

  try {

    const body = await request.json();
    console.log("PUT Branch Body:", body);
    const {
      Id,
      BranchCode,
      BranchName,
      Location,
      AddressL1,
      AddressL2,
      AddressL3,
      Manager,
      TP,
      Mobile,
      Status,
      Note,
      StartDate,
      IsMainBranch
    } = body;
    console.log("PUT Branch status:", Status);

    if (!Id) {

      return NextResponse.json(
        {
          success: false,
          message: "Branch Id is required"
        },
        {
          status: 400
        }
      );

    }


    const pool = await getSqlConnectionPool();


    await pool.request()

      .input("Id", Id)
      .input("BranchCode", BranchCode)
      .input("BranchName", BranchName)
      .input("Location", Location)
      .input("AddressL1", AddressL1)
      .input("AddressL2", AddressL2)
      .input("AddressL3", AddressL3)
      .input("Manager", Manager)
      .input("TP", TP)
      .input("Mobile", Mobile)
      .input("Status", Status)
      .input("Note", Note)
      .input("StartDate", StartDate)
      .input("IsMainBranch", IsMainBranch)
      .query(`

        UPDATE tb_branch

        SET

          BranchCode = @BranchCode,
          BranchName = @BranchName,
          Location = @Location,
          AddressL1 = @AddressL1,
          AddressL2 = @AddressL2,
          AddressL3 = @AddressL3,
          Manager = @Manager,
          TP = @TP,
          Mobile = @Mobile,
          Status = @Status,
          Note = @Note,
          StartDate = @StartDate,
          IsMainBranch = @IsMainBranch

        WHERE Id = @Id

      `);


    return NextResponse.json(
      {
        success: true,
        message: "Branch updated successfully"
      }
    );


  }
  catch(error) {

    console.error("PUT Branch Error:", error);


    return NextResponse.json(
      {
        success:false,
        message:"Update failed"
      },
      {
        status:500
      }
    );

  }

}

