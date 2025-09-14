import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComplexGrid({ item }) {
  return (
    <Card className="w-full md:w-5/12 p-2 bg-secondary m-2">
      <div className="flex w-full h-full px-2 justify-center items-center bg-card rounded-lg">
        <img
          className="w-31 h-31 p-2"
          src={item.icon}
          alt="Live from space album cover"
        />
        <div className="flex flex-col justify-around p-0.5 md:p-2 items-start w-full">
          <CardHeader>
            <CardTitle className="p-2 md:p-2 text-lg font-bold">
              {item.title.toUpperCase()}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row gap-1 py-2 flex-wrap">
            {item.langs.map((lang) => (
              <Badge key={lang} className="bg-gold font-semibold text-black">
                {lang}
              </Badge>
            ))}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
