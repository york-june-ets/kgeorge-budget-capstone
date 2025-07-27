'use client'

import styles from "../styles/overlay.module.css"

export function Overlay() {

    const closeModal = () => {
        // //modal slot doesn't to switch to default unless I do a full reload on the home page
        window.location.href = '/';
      };

    return (
        <div className={styles.overlay} onClick={closeModal}></div>
    )
}