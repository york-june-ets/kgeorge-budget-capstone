import stylesl from "@/styles/header.module.css"

export default function Header() {
    return (
        <div className={stylesl.header}>
            <div className="logo">
                <img className="logo_img" src="/logo.png"></img>
                <h1 className="logo_text">BudgetBook</h1>
            </div>
            <div className={stylesl.buttons}>
                <button className="buttonPrimary">Login</button>
                <button className="buttonPrimary">Signup</button> 
            </div>    
        </div>
        
    )
}