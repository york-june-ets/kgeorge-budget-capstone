'use client'

import { AuthContext } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useRef, useState } from "react"
import styles from "@/styles/edit-profile.module.css"
import { SignupRequest } from "@/types/SignupRequest"
import { fetchUpdateCustomer } from "@/lib/customer"

export default function EditProfile() {
    const router = useRouter()
    const {currentCustomer, logout} = useContext(AuthContext)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const confirmPassword = useRef<HTMLInputElement>(null)
    const [updateProfileRequest, setUpdateProfileRequest] = useState<SignupRequest>({firstName: "", lastName: "", email: "", password: "", phoneNumber: ""})

    useEffect(() => {
        if (!loading && currentCustomer) {
            setUpdateProfileRequest({
                firstName: currentCustomer.firstName,
                lastName: currentCustomer.lastName,
                email: currentCustomer.email,
                password: "",
                phoneNumber: currentCustomer.phoneNumber
            })
        }
    }, [currentCustomer])

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setError("")
        const {name, value} = event.target
        setUpdateProfileRequest(prev => ({
            ...prev,
            [name]: value
        }))
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const submitUpdateProfileRequest = async () => {
            try {
                const response = await fetchUpdateCustomer(updateProfileRequest)
                if (response.ok) {
                    setError("Profile updated successfully")
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
        if (updateProfileRequest.password === confirmPassword.current?.value) {
            submitUpdateProfileRequest()
        } else {
            setError("Passwords do not match")
        }
    }

    return (
        <div className="background">
            <div className="book">
                <div className="page-left">
                </div>
                <div className="page-right">
                    <div className="page-header">
                        <h1 className={styles.title}>Edit Profile</h1>
                    </div>   
                {loading && <p>Loading, please wait...</p>}
                <form className={styles.form} onSubmit={handleSubmit}>
                    <input type="text" name="firstName" placeholder="First Name*" value={updateProfileRequest.firstName} onChange={handleChange} disabled={loading} required></input>
                    <input type="text" name="lastName" placeholder="Last Name*" value={updateProfileRequest.lastName} onChange={handleChange} disabled={loading} required></input>
                    <input type="email" name="email" placeholder="Email*" value={updateProfileRequest.email} onChange={handleChange} disabled={loading} required></input>
                    <input type="password" name="password" placeholder="Password*" value={updateProfileRequest.password} onChange={handleChange} disabled={loading} minLength={8} required></input>
                    <input type="password" placeholder="Confirm Password*" ref={confirmPassword} onChange={handleChange} disabled={loading} required></input>
                    <input type="tel" name="phoneNumber" placeholder="Phone Number" value={updateProfileRequest.phoneNumber} onChange={handleChange} disabled={loading}></input>
                    <button className="buttonPrimary" type="submit" disabled={loading}>Save</button>
                    {error && <p>{error}</p>}
                </form>
                </div>
            </div>
            <div className="buttons">
                <button className="topButton" onClick={() => router.push('/table-of-contents')}>Table of Contents</button>
                <button className="topButton" onClick={logout}>Logout</button>
            </div>
        </div>
    )
}