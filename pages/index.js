import Head from 'next/head'
import SapphireReserveROICalculator from '../components/SapphireReserveROICalculator'

export default function Home() {
  return (
    <>
      <Head>
        <title>Valoretti - Sapphire Reserve ROI Calculator</title>
        <meta name="description" content="Calculate your Chase Sapphire Reserve return on investment with Valoretti's comprehensive ROI calculator." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SapphireReserveROICalculator />
    </>
  )
}

