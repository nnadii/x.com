import { Inter } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import Feed from '@/components/Feed'
import Login from '@/components/Login'
import Modal from '@/components/Modal'
import { getProviders, getSession, useSession } from "next-auth/react"
import { useRecoilState } from 'recoil'
import { modalState } from "../atoms/modalAtom"
import Widget from '@/components/Widget'


const inter = Inter({ subsets: ['latin'] })

export default function Home({ trendingResults, followResults, providers }) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(modalState)

  if (!session) return <Login providers={providers} />

  return (
    <div className=''>
      <main className='bg-black min-h-screen flex max-w-[1500px] mx-auto'>
        <Sidebar />
        <Feed />
        {session.user.name}
        <Widget trendingResults={trendingResults} followResults={followResults} />
        {isOpen && <Modal />}
      </main>
    </div>
  )
}

export async function getServerSideProps(context) {
  const trendingResults = await fetch("https://jsonkeeper.com/b/NKEV").then((res) => res.json())
  const followResults = await fetch("https://jsonkeeper.com/b/WWMJ").then((res) => res.json())
  const providers = await getProviders()
  const session = await getSession(context)
  return {
    props: { trendingResults, followResults, providers, session }
  }
}
