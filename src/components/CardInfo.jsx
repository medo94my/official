import * as React from 'react';
import { Card, CardContent } from "@/components/ui/card";

export default function CardInfo({item}) {
  return (
    <div className="w-full flex justify-center items-center h-full">
        <Card className="w-full h-full bg-[#0a0a0a] border border-gray-800 hover:border-primary transition-all duration-300 group cursor-pointer hover:shadow-[0_0_20px_rgba(255,215,0,0.1)]">
            <CardContent className="h-full flex flex-col items-center justify-center p-8 gap-6">
                {/* Render Image or Icon */}
                <div className="p-4 bg-black rounded-full border border-gray-800 group-hover:border-primary/50 transition-colors">
                    {item.img ? (
                         // If item.img is a functional component (Lucide icon)
                         (typeof item.img === 'function' || typeof item.img === 'object') ? (
                             <item.img className="w-10 h-10 text-white group-hover:text-primary transition-colors" />
                         ) : (
                             <img src={item.img} alt={item.desc} className="w-12 h-12 object-contain" />
                         )
                    ) : item.iconUrl ? (
                        <img src={item.iconUrl} alt={item.desc} className="w-12 h-12 object-contain" />
                    ) : null}
                </div>

                <div className="text-center space-y-2">
                    <h5 className="text-xl uppercase font-bold text-white group-hover:text-primary transition-colors">
                        {item.desc}
                    </h5>
                    <p className="text-sm text-gray-500 max-w-[200px] mx-auto hidden group-hover:block animate-in fade-in slide-in-from-bottom-2">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
