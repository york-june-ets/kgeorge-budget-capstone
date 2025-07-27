import Header from "@/components/Header"
import styles from "@/styles/home.module.css"

export default function Home() {
  return (
    <div className={styles.home}>
      <Header/>
      <div className={styles.slide}>
        <div className={styles.block}>
          <h1 className={styles.title}>Track Your Spending.<br/>Grow Your Savings.<br/>With Budget Book.</h1>
          <p className={styles.body}>Budget Book helps you take control of your finances. Track your accounts, monitor spending, build custom budgets, categorize expenses, and set financial goals with ease.</p>
        </div>
        <video className={styles.video} autoPlay muted>
          <source src="intro_video.mp4" type="video/mp4"/>
          <img src="/intro_video_fallback.png" alt="budget book displayed on a computer screen"/>
        </video>
      </div>
    </div>
  )
}
