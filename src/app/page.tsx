import Button from '@/components/ui/Button'
import { db } from '@/lib/db'
import Image from 'next/image'

export default async function Home() {

  // await db.set('hello', 'hello');

  return (
    <div>
      <h2>hello world</h2>
      <Button size={'sm'} variant={'default'} isLoading={false}>Hello there click me</Button>
    </div>
  )
}
