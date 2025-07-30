'use client'

import Header from "@/components/Header"
import styles from "@/styles/welcome.module.css"
import { useRouter } from "next/navigation"

export default function Welcome() {
  const router = useRouter()
  
  return (
    <div className={styles.welcome}>
      <Header />
      <div className={styles.backgroundLayout}>
        <div className={styles.videoWrapper}>
          <video className={styles.backgroundVideo} autoPlay muted playsInline>
            <source src="intro_video.mp4" type="video/mp4" />
            <img src="/fallback.png" alt="fallback image" />
          </video>
          <div className={styles.videoFade}></div>
        </div>
        <div className={styles.content}>
          <h1>Budget.</h1>
          <h1>Track it.</h1>
          <h1>Save.</h1>
          <p>Take control of your financial future by tracking your daily spending habits, identifying opportunities to save, and building lasting financial security—all with the powerful tools and insights of Budget Book.</p>
          <button className="buttonSecondary" onClick={() => router.push('/login')}>Get Started</button>
        </div>
      </div>
    </div>
  )
}
