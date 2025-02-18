import type React from "react"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { setLoading, setUser, setError } from "../../redux/userslice"
import api from "../../Axios/userInstance"
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import App from "../../features/FirebaseAuthentication/config"
import { useNavigate } from "react-router-dom"
import ForgotPasswordModal from "../CommonComponents/Modals/ForgotPasswordModal"
import toast from "react-hot-toast"
interface LoginResponse {
  success: boolean;
  message: string
  data: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  }
}

interface GoogleSignInResponse {
  user: {
    id: string
    name: string
    email: string
    googleId: string
  }
  message: string
}

const LoginForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
  

    if (!email || !password) {
      toast.error("Email and password are required.")
      return
    }

    dispatch(setLoading())
    try {
      const response = await api.post<LoginResponse>("/login", { email, password }, { withCredentials: true })
console.log(response)
      const { user } = response.data.data
      dispatch(setUser({ name: user.name, email: user.email }))
      toast.success('Login successfil')
   
      navigate("/")
    }   catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
   
      dispatch(setError(errorMessage));
      toast.error(errorMessage); // Add toast notification
    }
}

  const handleGoogleSignIn = async () => {
    const auth = getAuth(App)
    const provider = new GoogleAuthProvider()

    try {
      dispatch(setLoading())
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()

      const response :any= await api.post<GoogleSignInResponse>("/google", { idToken }, { withCredentials: true })
      console
      const user  = response.data.data
console.log(user)
      dispatch(setUser(user))
      toast.success('Google Sign-In successful!')
     
      navigate("/")
    } catch (error: any) {
      console.error(error)
      const errorMessage = error.response?.data?.message || "Google Sign-In failed. Please try again."
   
      dispatch(setError(errorMessage))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sepia-100 p-4">
      <div className="w-full max-w-md bg-sepia-50 rounded-none shadow-2xl border-2 border-sepia-300 p-8 relative">
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-sepia-300"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-sepia-300"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-sepia-300"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-sepia-300"></div>

        <h2 className="text-3xl font-serif font-bold text-sepia-900 mb-6 text-center">User Login</h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-serif font-medium text-sepia-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-sepia-50 border-2 border-sepia-300 rounded-none focus:outline-none focus:ring-2 focus:ring-sepia-500 text-sepia-900 font-serif"
            
            />
          </div>
          <div>
            <label className="block text-sm font-serif font-medium text-sepia-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-sepia-50 border-2 border-sepia-300 rounded-none focus:outline-none focus:ring-2 focus:ring-sepia-500 text-sepia-900 font-serif"
               
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-sepia-700 text-sepia-50 rounded-none font-serif font-medium hover:bg-sepia-800 transition-colors duration-300"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-serif text-sepia-700 mb-2">Or sign in with:</p>
          <button
            onClick={handleGoogleSignIn}
            className="bg-red-700 text-sepia-50 py-2 px-4 rounded-none hover:bg-red-800 transition-colors duration-300 font-serif"
          >
            Sign in with Google
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => setShowForgotPassword(true)}
            className="text-sepia-700 text-sm font-serif hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <ForgotPasswordModal show={showForgotPassword} onClose={() => setShowForgotPassword(false)} role={"user"} />

        
      </div>
    </div>
  )
}

export default LoginForm

