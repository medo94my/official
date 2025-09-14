import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

const Arrow = () => (
  <span className="hidden lg:inline-block after:content-['→'] after:text-gold after:animate-arrow after:absolute after:text-9xl after:font-bold after:top-1/2 after:-right-10 after:-translate-y-1/2" />
)

export default function CardInfo({ item }) {
  return (
    <div className="p-3 relative w-full sm:w-4/12 flex justify-center items-center">
      <Card className="w-full min-w-[17rem]">
        <div className="h-[15rem]">
          <CardContent className="text-center">
            <h3 className="uppercase text-primary">{item.desc}</h3>
          </CardContent>
          <Image src={item.img} alt={item.desc} width={128} height={128} className="block w-32 h-32 mx-auto p-2" />
        </div>
      </Card>
      {item.id !== 3 && <Arrow />}
    </div>
  )
}
