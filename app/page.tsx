import Image from 'next/image'
import Courses from '@/components/Courses'

export default function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <Courses />
      </main>
    </>
  )
}
