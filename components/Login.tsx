import { useState } from "react"
import { firebaseAuth } from "firewand";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import LoadingButton from "./Buttons/LoadingButton"
import GoogleIcon from "./icons/GoogleIcon"

export default function Login(props: any) {

    const [loadingGoogleLogin, setLoadingGoogleLogin] = useState(false);

    const signInWithGoogleRedirect = async () => {
        setLoadingGoogleLogin(true);
        const provider = new GoogleAuthProvider();
        await signInWithPopup(firebaseAuth, provider).then((result) => {
            if (result) {
                props.onClose();
            }
        }).catch((error) => {
            console.log(error);
        });
        setLoadingGoogleLogin(false);
    }

    return (
        <>
            <main className="flex flex-col h-full items-center justify-center p-24">
                <h1>login</h1>
                {loadingGoogleLogin ? <LoadingButton /> : (
                    <button type="button" className="text-white bg-[#4285F4] hover:bg-[#4285F4]/30 dark:hover:bg-[#4285F4]/30 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2"
                        onClick={signInWithGoogleRedirect}
                    >
                        <GoogleIcon />
                        Sign in with Google
                    </button>
                )}
            </main>
        </>
    )
}