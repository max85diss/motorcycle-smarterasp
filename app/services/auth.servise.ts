import { UserRepository } from "../repositories/user.repository"; 
import bcrypt from "bcrypt"; 

export class AuthService {
    
    static async login(username: string, password: string)
     {
        console.log("authservise:",username);
        const user = await UserRepository.getUserByUsername(username);
        
        console.log(user);

        if (!user) { return null;

         }
         // If passwords are hashed: 
         // // const isValid = await bcrypt.compare(password, user.password); 
         // // If your SQL Server currently stores plain-text passwords: 
         const isValid = password === user.Password;
            console.log(isValid);

          if (!isValid) { return null; } 
          
          return { empCode: user.EmpCode, username: user.Username, position: user.Position, location: user.Location,branchCode:user.BranchCode, photo:user.Photo }; 
        }
     }