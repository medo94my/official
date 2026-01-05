import * as React from 'react';

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";


export default function ComplexGrid({item}) {
  return (
    <div>
      <div className='flex w-full'>

        <div className="flex flex-col justify-center items-start p-2 md:p-4 gap-2">
        <img
          className="w-[124px] h-[124px] p-2 object-contain"
          src={item.icon}
          alt={item.title}
        />
          <div className="text-xl uppercase p-1 font-medium">
            {item.title.toUpperCase()}
          </div>
          
        </div>
        <div className="flex w-full">
            {item.langs.map((lang) => (
              <motion.span 
              initial={{ scale: 0 }} animate={{ scale: 1 }}
                key={lang} 
                className="bg-[gold] font-semibold text-black px-3 py-1 rounded-full text-sm"
              >
                {lang}
              </motion.span>
            ))}
          </div>
      </div>
    </div>
  );
}
