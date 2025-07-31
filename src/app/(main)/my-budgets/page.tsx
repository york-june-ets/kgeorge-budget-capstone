import styles from "@/styles/my-budgets.module.css"

export default function MyBudgets() {
    return (
        <div className="book">
            <div className="page-left"></div>
            <div className="page-right">
                <div className="page-header">
                    <h1 className={styles.title}>Budget & Category Management</h1>
                </div>
            </div>
        </div>
    )
}