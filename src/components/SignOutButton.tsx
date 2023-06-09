'use client'

import { ButtonHTMLAttributes, FunctionComponent, useState } from "react";
import Button from "./ui/Button";
import { signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Loader2, LogOut } from "lucide-react";


interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    
}
 
const SignOutButton: FunctionComponent<SignOutButtonProps> = ({...props}) => {

    const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
    return ( 
        <Button
        {...props}
        variant={'ghost'}
        onClick={async () =>{
            setIsSigningOut(true);
            try {
                await signOut()
            }catch (err){
                toast.error('there was an error signing out')
            }finally{
                setIsSigningOut(false);
            }
        }}
        >
            {isSigningOut ? (
                <Loader2 className="animate-spin h-4 w-4"/>
            ): (
                <LogOut className="w-4 h-4"/>
            )}
        </Button>
     );
}
 
export default SignOutButton;