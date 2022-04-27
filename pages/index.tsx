import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Troopz dApp</title>
        <meta name="description" content="Troopz dApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
          <Image src="/images/header-graphic.png" width= "1291" height="738" />
        <h1 className={styles.title}>
          The Trooprz <Link href="mint/mint"><a>minting platform!</a></Link>
        </h1>

        <p className={styles.description}>
          Claim and/or mint your miCRObes here{' '}
            <Link href="mint/mint"><a><code className={styles.code}>minting page</code></a></Link>
        </p>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://trooprz.army"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/images/trooprz-logo.svg" alt="Trooprz Logo" width={180} height={55} />
          </span>
        </a>
      </footer>
    </div>
  )
}
