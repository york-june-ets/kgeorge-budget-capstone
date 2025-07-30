import Header from "@/components/Header"
import styles from "@/styles/welcome.module.css"

export default function Welcome() {
  return (
    <div className={styles.home}>
      <Header/>
      <div className={styles.slide}>
        <video className={styles.video} autoPlay muted>
          <source src="intro_video.mp4" type="video/mp4"/>
          <img src="/intro_video_fallback.png" alt="budget book displayed on a computer screen"/>
        </video>
      </div>
    </div>
  )
}
