import { useState } from "react"
import { firebaseAuth } from "@/utils/firebase/firebase.config";
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
            <main className="flex flex-col h-full items-center justify-center p-24 text-[color:var(--ai-foreground)]">
                <h1 className="text-2xl font-bold mb-8">Login to your account</h1>
                {loadingGoogleLogin ? <LoadingButton /> : (
                    <button
                        type="button"
                        className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 transition-all duration-300 transform hover:-translate-y-1"
                        onClick={signInWithGoogleRedirect}
                    >
                        <GoogleIcon />
                        <span className="ml-2">Sign in with Google</span>
                    </button>
                )}
                <div className="mt-8 text-[color:var(--ai-muted)] text-sm">
                    By signing in, you agree to our <a href="/terms-conditions" className="text-[color:var(--ai-primary)] hover:underline">Terms & Conditions</a> and <a href="/privacy-policy" className="text-[color:var(--ai-primary)] hover:underline">Privacy Policy</a>.
                </div>
            </main>
        </>
    )
}