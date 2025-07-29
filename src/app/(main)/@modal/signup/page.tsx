'use client'

import { Overlay } from "@/components/Overlay"
import { fetchCreateCustomer } from "@/lib/customer"
import styles from '@/styles/signup.module.css'
import { SignupRequest } from "@/types/SignupRequest"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

export default function SignupModal() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<String>("")
    const [signupRequest, setSignupRequest] = useState<SignupRequest>({firstName: "", lastName: "", email: "", password: "", phoneNumber: ""})
    const confirmPassword = useRef<HTMLInputElement>(null)
    const router = useRouter()

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setError("")
        const {name, value} = event.target
        setSignupRequest(prev => ({
            ...prev,
            [name]: value
        }))
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const submitSignupRequest = async () => {
            try {
                const response = await fetchCreateCustomer(signupRequest)
                if (response.ok) {
                    router.push('/login')
                } 
                else {
                    const error = await response.json()
                    setError(error.message)
                }
            } catch (err) {
                setError("An unexpected error occured")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        if (signupRequest.password === confirmPassword.current?.value) {
            submitSignupRequest()
        } else {
            setError("Passwords do not match")
        }
    }

    return (
        <>
            <Overlay/>
            <div className={styles.signup}>
                <div>
                    <img className="logo_img" src="/logo.png" alt="budget bank logo"></img>
                    <h1 className="logo_text">signup</h1>     
                </div>
                {loading && <p>Loading, please wait...</p>}
                <form className={styles.form} onSubmit={handleSubmit}>
                    <input type="text" name="firstName" placeholder="First Name*" value={signupRequest.firstName} onChange={handleChange} disabled={loading} required></input>
                    <input type="text" name="lastName" placeholder="Last Name*" value={signupRequest.lastName} onChange={handleChange} disabled={loading} required></input>
                    <input type="email" name="email" placeholder="Email*" value={signupRequest.email} onChange={handleChange} disabled={loading} required></input>
                    <input type="password" name="password" placeholder="Password*" value={signupRequest.password} onChange={handleChange} disabled={loading} minLength={8} required></input>
                    <input type="password" placeholder="Confirm Password*" ref={confirmPassword} onChange={handleChange} disabled={loading} required></input>
                    <input type="tel" name="phoneNumber" placeholder="Phone Number" value={signupRequest.phoneNumber} onChange={handleChange} disabled={loading}></input>
                    <button className="buttonPrimary" type="submit" disabled={loading}>Signup</button>
                    {error && <p>{error}</p>}
                </form>
                <p>Already have an account? <a href='/login'>Log in.</a></p>
            </div>
        </> 
    )
}