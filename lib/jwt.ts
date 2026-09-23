import { SignJWT, jwtVerify, JWTPayload } from "jose";
 const secret = new TextEncoder().encode(process.env.JWT_SECRET!);


  export interface UserJwtPayload extends JWTPayload {
     empCode: string; 
     username: string;
      position: string;
      location:string;
      branchCode:string; 
      photo:string;
    }


   export async function generateToken(payload: UserJwtPayload): Promise<string> { 
    console.log(secret);
    console.log(payload);
    return await new SignJWT(payload) 
    .setProtectedHeader({ alg: "HS256" }) 
    .setIssuedAt() .setExpirationTime("8h") 
    .sign(secret); 
} 
    
    
    export async function verifyToken(token: string): Promise<UserJwtPayload> { 
        const { payload } = await jwtVerify(token, secret);
         return payload as UserJwtPayload;
     }

     export function decodeToken(token: string)
      { 
        const payload = token.split(".")[1];
         if (!payload) { throw new Error("Invalid JWT token"); } 
         
      return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")); 
    }